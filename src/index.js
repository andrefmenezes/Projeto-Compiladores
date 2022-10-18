import ohm from 'ohm-js';
import fs from 'fs';
import grammar from './grammatics/grammar.js'
import inputs from './inputs/inputs.js';
import { converteTreeToCode } from './util/utils.js';

// Criação da gramática
const myGrammar = ohm.grammar(grammar);

// Criação da semântica
const semantic = myGrammar.createSemantics();

const userInput = inputs;

function verificarEGerarCodigo(input) {
  const result = myGrammar.match(input);

  if (result.failed()) { // Verifica se há erros
    console.log("Entrada inválida!\n");
    console.log(result.message);
    console.log("\n");
    return; // Para a execução
  } 

  // Adiciona a operação de geração de árvore na semantica
  semantic.addOperation('toTree', {
    Exp(t,sp, tn) { return {exp: [t.toTree(), ...tn.toTree()]}; },
    Tag_text(op, t, cp){ return { tag: t.toTree() }},
    Tag_tag(n, op, p, v, pn, cp) { 
      return {
        tag: n.toTree(),
        props: [p.toTree(), ...pn.toTree()]
      }; 
    },
    Tag(t){ return t.toTree() },
    Prop_tag(p) { return { propTag: p.toTree() } },
    Prop_restrict(r) { return { restriction: r.toTree() }},
    Prop_children(ch) { return {child: ch.toTree() }},
    Prop_empty(e) { return; },
    Prop(e) { return e.toTree() },
    Children(c, t) { return t.toTree() },
    PropTag(pn, v, pv) { return { propName: pn.toTree(), propValue: pv.toTree() }},
    propName(_) { return this.sourceString; },
    propValue(_) { return this.sourceString; },
    name(_) { return {name: this.sourceString}; },
    text(_) { return this.sourceString; },
    restriction(_) { return this.sourceString; },
    _terminal() { return this.primitiveValue; }
  });

  // Gera a árvore semântica do resultado
  const tree = semantic(result).toTree();

  // O console.log abaixo mostra o objeto gera através da operação 'toTree' realizada peça semântica
  // console.log('Tree', JSON.stringify(tree, null, 2));

  // Criação dos arquivos para o código HTML e as funções
  const code = converteTreeToCode(tree);
  const html = new Uint8Array(Buffer.from(code.html));
  
  // Criação o arquivo html.txt
  fs.writeFile('src/generated/html.html', html, (err) => {
    if (err) throw err;
    console.log('Arquivo html criado com sucesso!\nDiretório: "src/generated/html.html"\n');
  });
}

verificarEGerarCodigo(userInput);