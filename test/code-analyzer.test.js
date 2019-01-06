import assert from 'assert';
import {makeCodeGraph, replaceParams} from '../src/js/code-analyzer';


let first_test_input=makeCodeGraph(
    'function foo(x){\n' +
    '    return x;' +
    '}','');
it('Generating the graph of the first example correctly',()=>{
    assert.deepEqual(first_test_input,'n0 [label="-1-\nreturn x;"]\n\nn0[style=filled,color=green]\nn0[shape=box]'
    );
});

let second_test_input=makeCodeGraph(
    'function foo(x){\n' +
    '   if(x>3)\n' +
    '      x=6;\n' +
    '   else\n' +
    '      x=0;\n' +
    '   return x;\n' +
    '}','4');
it('Generating the graph of the second example correctly',()=>{
    assert.deepEqual(second_test_input, 'n0 [label="-1-\nx > 3"]\nn1 [label="-2-\nx = 6"]\nn2 [label="-3-\nreturn x;"]\nn3 [label="-4-\nx = 0"]\nn0 -> n1 [label="true"]\nn0 -> n3 [label="false"]\nn1 -> n2 []\nn3 -> n2 []\n\nn0[style=filled,color=green]\nn0[shape=diamond]\nn1[style=filled,color=green]\nn1[shape=box]\nn3[shape=box]\nn2[style=filled,color=green]\nn2[shape=box]'
    );
});

let third_test_input=replaceParams('x+2',new Map([['x',3]]));
it('replacing params correctly',()=>{
    assert.deepEqual(third_test_input, '3+2'
    );
});

let fourth_test_input=replaceParams('x+2+a',new Map([['x',3],['a','x-5']]));
it('replacing params correctly',()=>{
    assert.deepEqual(fourth_test_input, '3+2+3-5'
    );
});


let fifth_test_input=makeCodeGraph(
    'function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '    \n' +
    '    if (b < z) {\n' +
    '        c = c + 5;\n' +
    '    } else if (b < z * 2) {\n' +
    '        c = c + x + 5;\n' +
    '    } else {\n' +
    '        c = c + z + 5;\n' +
    '    }\n' +
    '    \n' +
    '    return c;\n' +
    '}\n','1,2,3');
it('Generating the graph of the given example correctly',()=>{
    assert.deepEqual(fifth_test_input,'n0 [label="-1-\nlet a = x + 1;"]\nn1 [label="-2-\nlet b = a + y;"]\nn2 [label="-3-\nlet c = 0;"]\nn3 [label="-4-\nb < z"]\nn4 [label="-5-\nc = c + 5"]\nn5 [label="-6-\nreturn c;"]\nn6 [label="-7-\nb < z * 2"]\nn7 [label="-8-\nc = c + x + 5"]\nn8 [label="-9-\nc = c + z + 5"]\nn0 -> n1 []\nn1 -> n2 []\nn2 -> n3 []\nn3 -> n4 [label="true"]\nn3 -> n6 [label="false"]\nn4 -> n5 []\nn6 -> n7 [label="true"]\nn6 -> n8 [label="false"]\nn7 -> n5 []\nn8 -> n5 []\n\nn0[style=filled,color=green]\nn0[shape=box]\nn1[style=filled,color=green]\nn1[shape=box]\nn2[style=filled,color=green]\nn2[shape=box]\nn3[style=filled,color=green]\nn3[shape=diamond]\nn4[shape=box]\nn6[style=filled,color=green]\nn6[shape=diamond]\nn7[style=filled,color=green]\nn7[shape=box]\nn8[shape=box]\nn5[style=filled,color=green]\nn5[shape=box]');
});

let sixth_test_input=makeCodeGraph(
    'function foo(x, y, z){\n' +
    '   let a = x + 1;\n' +
    '   let b = a + y;\n' +
    '   let c = 0;\n' +
    '   \n' +
    '   while (a < z) {\n' +
    '       c = a + b;\n' +
    '       z = c * 2;\n' +
    '       a++;\n' +
    '   }\n' +
    '   \n' +
    '   return z;\n' +
    '}','');
it('Generating the graph of the second given example correctly (with no params)',()=>{
    assert.deepEqual(sixth_test_input,'n0 [label="-1-\nlet a = x + 1;"]\nn1 [label="-2-\nlet b = a + y;"]\nn2 [label="-3-\nlet c = 0;"]\nn3 [label="-4-\na < z"]\nn4 [label="-5-\nc = a + b"]\nn5 [label="-6-\nz = c * 2"]\nn6 [label="-7-\na++"]\nn7 [label="-8-\nreturn z;"]\nn0 -> n1 []\nn1 -> n2 []\nn2 -> n3 []\nn3 -> n4 [label="true"]\nn3 -> n7 [label="false"]\nn4 -> n5 []\nn5 -> n6 []\nn6 -> n3 []\n\nn0[style=filled,color=green]\nn0[shape=box]\nn1[style=filled,color=green]\nn1[shape=box]\nn2[style=filled,color=green]\nn2[shape=box]\nn3[style=filled,color=green]\nn3[shape=diamond]\nn4[shape=box]\nn5[shape=box]\nn6[shape=box]\nn7[style=filled,color=green]\nn7[shape=box]'
    );
});


let sixth_b_test_input=makeCodeGraph(
    'function foo(x, y, z){\n' +
    '   let a = x + 1;\n' +
    '   let b = a + y;\n' +
    '   let c = 0;\n' +
    '   \n' +
    '   while (a < z) {\n' +
    '       c = a + b;\n' +
    '       z = c * 2;\n' +
    '       a++;\n' +
    '   }\n' +
    '   \n' +
    '   return z;\n' +
    '}','1,2,3');
it('Generating the graph of the second given example correctly (with params)',()=>{
    assert.deepEqual(sixth_b_test_input,'n0 [label="-1-\nlet a = x + 1;"]\nn1 [label="-2-\nlet b = a + y;"]\nn2 [label="-3-\nlet c = 0;"]\nn3 [label="-4-\na < z"]\nn4 [label="-5-\nc = a + b"]\nn5 [label="-6-\nz = c * 2"]\nn6 [label="-7-\na++"]\nn7 [label="-8-\nreturn z;"]\nn0 -> n1 []\nn1 -> n2 []\nn2 -> n3 []\nn3 -> n4 [label="true"]\nn3 -> n7 [label="false"]\nn4 -> n5 []\nn5 -> n6 []\nn6 -> n3 []\n\nn0[style=filled,color=green]\nn0[shape=box]\nn1[style=filled,color=green]\nn1[shape=box]\nn2[style=filled,color=green]\nn2[shape=box]\nn3[style=filled,color=green]\nn3[shape=diamond]\nn4[style=filled,color=green]\nn4[shape=box]\nn5[style=filled,color=green]\nn5[shape=box]\nn6[style=filled,color=green]\nn6[shape=box]\nn7[style=filled,color=green]\nn7[shape=box]'
    );
});


let seventh_test_input=makeCodeGraph(
    'function foo(x){\n' +
    '    let a=x+2;\n' +
    '    a--;\n' +
    '    return a;\n' +
    '}','1');
it('Generating graph with -- update expression correctly',()=>{
    assert.deepEqual(seventh_test_input,'n0 [label="-1-\nlet a = x + 2;"]\nn1 [label="-2-\na--"]\nn2 [label="-3-\nreturn a;"]\nn0 -> n1 []\nn1 -> n2 []\n\nn0[style=filled,color=green]\nn0[shape=box]\nn1[style=filled,color=green]\nn1[shape=box]\nn2[style=filled,color=green]\nn2[shape=box]'
    );
});

let eighth_test_input=makeCodeGraph(
    'function foo(x){\n' +
    '    if(x>5){\n' +
    '        x--;\n' +
    '        if(x>2){\n' +
    '           x++;\n' +
    '        }\n' +
    '    }\n' +
    '    return x;\n' +
    '}','1');
it('Generating the graph of a non-green if correctly',()=>{
    assert.deepEqual(eighth_test_input,'n0 [label="-1-\nx > 5"]\nn1 [label="-2-\nx--"]\nn2 [label="-3-\nx > 2"]\nn3 [label="-4-\nx++"]\nn4 [label="-5-\nreturn x;"]\nn0 -> n1 [label="true"]\nn0 -> n4 [label="false"]\nn1 -> n2 []\nn2 -> n3 [label="true"]\nn2 -> n4 [label="false"]\nn3 -> n4 []\n\nn0[style=filled,color=green]\nn0[shape=diamond]\nn1[shape=box]\nn2[shape=diamond]\nn3[shape=box]\nn4[style=filled,color=green]\nn4[shape=box]'
    );
});

let ninth_test_input=makeCodeGraph(
    'function foo(x){\n' +
    '    if(x>2){\n' +
    '        let a=5;\n' +
    '    }\n' +
    '    return x;\n' +
    '}','1');
it('Generating the graph of a non-green var declaration correctly',()=>{
    assert.deepEqual(ninth_test_input,'n0 [label="-1-\nx > 2"]\nn1 [label="-2-\nlet a = 5;"]\nn2 [label="-3-\nreturn x;"]\nn0 -> n1 [label="true"]\nn0 -> n2 [label="false"]\nn1 -> n2 []\n\nn0[style=filled,color=green]\nn0[shape=diamond]\nn1[shape=box]\nn2[style=filled,color=green]\nn2[shape=box]'
    );
});

let tenth_test_input=makeCodeGraph(
    'function foo(x){\n' +
    '    if(x>3){\n' +
    '        while(x<6)\n' +
    '         x++;\n' +
    '    }\n' +
    '\n' +
    '    return x;\n' +
    '}','1');
it('Generating the graph of a non-green while correctly',()=>{
    assert.deepEqual(tenth_test_input,'n0 [label="-1-\nx > 3"]\nn1 [label="-2-\nx < 6"]\nn2 [label="-3-\nx++"]\nn3 [label="-4-\nreturn x;"]\nn0 -> n1 [label="true"]\nn0 -> n3 [label="false"]\nn1 -> n2 [label="true"]\nn1 -> n3 [label="false"]\nn2 -> n1 []\n\nn0[style=filled,color=green]\nn0[shape=diamond]\nn1[shape=diamond]\nn2[shape=box]\nn3[style=filled,color=green]\nn3[shape=box]'
    );
});


let eleventh_test_input=makeCodeGraph(
    'function foo(x){\n' +
    'let a=5;\n' +
    '    if(x>3){\n' +
    '       if(x>4)\n' +
    '        a++;\n' +
    '     }\n' +
    '    else if(x<7){\n' +
    '      a--;\n' +
    '       }\n' +
    '   return x;\n' +
    '}','4');
it('Generating the graph of if-else correctly',()=>{
    assert.deepEqual(eleventh_test_input,'n0 [label="-1-\nlet a = 5;"]\nn1 [label="-2-\nx > 3"]\nn2 [label="-3-\nx > 4"]\nn3 [label="-4-\na++"]\nn4 [label="-5-\nreturn x;"]\nn5 [label="-6-\nx < 7"]\nn6 [label="-7-\na--"]\nn0 -> n1 []\nn1 -> n2 [label="true"]\nn1 -> n5 [label="false"]\nn2 -> n3 [label="true"]\nn2 -> n4 [label="false"]\nn3 -> n4 []\nn5 -> n6 [label="true"]\nn5 -> n4 [label="false"]\nn6 -> n4 []\n\nn0[style=filled,color=green]\nn0[shape=box]\nn1[style=filled,color=green]\nn1[shape=diamond]\nn2[style=filled,color=green]\nn2[shape=diamond]\nn3[shape=box]\nn5[shape=diamond]\nn6[shape=box]\nn4[style=filled,color=green]\nn4[shape=box]'
    );
});
