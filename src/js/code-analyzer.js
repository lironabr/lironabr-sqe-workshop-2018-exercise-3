import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
import * as esgraph from 'esgraph';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc: true}).body;
};

const handlers = [];

handlers['AssignmentExpression'] = AssignmentExpressionHandler;
handlers['FunctionDeclaration'] = FunctionDeclarationHandler;
handlers['VariableDeclaration'] = VariableDeclarationHandler;
handlers['WhileStatement'] = WhileStatementHandler;
handlers['IfStatement'] = IfStatementHandler;
handlers['ReturnStatement'] = ReturnStatementHandler;
handlers['BlockStatement'] = BlockStatementHandler;
handlers['ExpressionStatement'] = ExpressionStatementHandler;
handlers['UpdateExpression'] = UpdateExpressionHandler;

let env = new Map();
env.clear();
let paramValuesArr = [];
let style = '';
let currentNode;
let graph;

function makeGraphArr(node, inPath) {
    handlers[node.type](node, inPath);
}

function greenFill() {
    style += '\nn' + graph.indexOf(currentNode) + '[style=filled,color=green]';
}

function boxShape() {
    style += '\nn' + graph.indexOf(currentNode) + '[shape=box]';
}

function diamondShape() {
    style += '\nn' + graph.indexOf(currentNode) + '[shape=diamond]';
}

function UpdateExpressionHandler(node, inPath) {
    let k = 0;
    (node.operator === '++') ? k = 1 : k = -1;
    env.set(node.argument.name, (env.get(node.argument.name) + '+' + k));
    if (inPath) greenFill();

    boxShape();
    currentNode = currentNode.normal;
}

function AssignmentExpressionHandler(node, inPath) {
    env.set(node.left.name, escodegen.generate(node.right));
    if (inPath) greenFill();

    boxShape();
    currentNode = currentNode.normal;
}

function FunctionDeclarationHandler(node, inPath) {
    let current_env = env;
    env = new Map(env);
    for (let i = 0; i < node.params.length; i++) {
        env.set(node.params[i].name, (paramValuesArr[i] !== undefined) ? escodegen.generate(paramValuesArr[i]) : node.params[i].name);
    }
    node.body.body.map((line) => makeGraphArr(line, inPath));
    env = current_env;
}

function VariableDeclarationHandler(node, inPath) {
    node.declarations.forEach(decl => env.set(decl.id.name, escodegen.generate(decl.init)));
    if (inPath) greenFill();
    boxShape();
    currentNode = currentNode.normal;
}

function WhileStatementHandler(node, inPath) {
    let test_value = tryEval(replaceParams(escodegen.generate(node.test), env));
    let path = [inPath];
    let current_env = env;
    let rest;
    env = new Map(env);
    if (inPath) greenFill();
    diamondShape();

    currentNode = currentNode.true;
    rest = makeGraphArr(node.body, test_value && inPath);
 
    path.push(rest);
    env = current_env;
    currentNode = currentNode.false;
}

function IfStatementHandler(node, isPath) {
    let path = [isPath];
    let test = replaceParams(escodegen.generate(node.test), env);
    let test_value = tryEval(test);
    let ifNode = currentNode;
    let current_env = env;
    env = new Map(env);
    if (isPath) greenFill();
    diamondShape();
    currentNode = ifNode.true;
    path.push(makeGraphArr(node.consequent, test_value && isPath));
    if (node.alternate) {
        currentNode = ifNode.false;
        path.push(makeGraphArr(node.alternate, !test_value && isPath));
    }
    env = current_env;
}

function tryEval(toEval) {
    let result;
    try {
        result = eval(toEval);
        return result;
    } catch (e) {
        return false;
    }
}

function ReturnStatementHandler(node, inPath) {
    greenFill();
    boxShape();
    return inPath;
}

function BlockStatementHandler(node, inPath) {
    node.body.map(sub_node => makeGraphArr(sub_node, inPath));
}

function ExpressionStatementHandler(node, inPath) {
    makeGraphArr(node.expression, inPath);
}

function makeCodeGraph(code, paramValues) {
    paramValuesArr = [];
    extractParamValues(paramValues);
    let parsedCode = parseCode(code);
    style = '';
    let finalGraph = getGraph(parsedCode[0].body);
    graph = finalGraph[2];
    currentNode = finalGraph[0];
    makeGraphArr(parsedCode[0], true);
    finalGraph = esgraph.dot(finalGraph);
    return finalGraph + style;

}

function editGraph(cfg) {
    let tmpGraph = cfg[2].slice(1, cfg[2].length - 1);
    let finalNode = cfg[1];
    let nodeIndex = 1;
    tmpGraph[0].prev = [];
    cfg[0] = tmpGraph[0];
    cfg[2] = tmpGraph;
    cfg[2].forEach(node => {
        node.label = '-' + nodeIndex + '-\n' + escodegen.generate(node.astNode);
        nodeIndex++;
        let index = node.next.indexOf(finalNode);
        if (index > -1) node.next.splice(index, 1);
        if (node.normal === finalNode) node.normal = undefined;
        if (node.astNode.type === 'ReturnStatement') cfg[1] = node;
        node.exception = undefined;
    });
    cfg[1].normal = undefined;
    return cfg;
}

function getGraph(code) {
    let cfg = esgraph(code);
    return editGraph(cfg, {range: true});
}

function extractParamValues(paramValues) {
    paramValuesArr = parseCode(paramValues)[0];
    if (!paramValuesArr) {
        paramValuesArr = [];
    } else {
        if (paramValuesArr.expression.type === 'SequenceExpression') {
            paramValuesArr = paramValuesArr.expression.expressions;
        } else {
            paramValuesArr = [paramValuesArr.expression];
        }
    }
}


function replaceParams(toReplace, paramValues) {
    let iterator = paramValues.keys();
    let res = toReplace;
    let arrOfReversedKeys = [];
    for (let key of iterator)
        arrOfReversedKeys.push(key);
    arrOfReversedKeys = arrOfReversedKeys.reverse();
    arrOfReversedKeys.forEach(key => res = res.replace(new RegExp(key, 'g'), paramValues.get(key)));
    return res;
}


export {makeCodeGraph,replaceParams};

