import $ from 'jquery';
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';

import {makeCodeGraph} from './code-analyzer';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let params=$('#paramsPlaceholder').val();
        let dot = makeCodeGraph(codeToParse,params);
        let viz = new Viz({ Module, render });
        viz.renderString('digraph { ' +  dot + ' }')
            .then(function(graph) {
                document.getElementById('parsedCode').innerHTML = graph;
            });
    });
});

