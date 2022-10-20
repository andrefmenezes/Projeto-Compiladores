import ohm from 'ohm-js';
import fs from 'fs';
import inputs from './inputs/inputs.js';

const grammar = `Grammar {
  Exp = Tag ("\\n"? Tag)*
  Tag = ("(" text ")")                         --text
      | (name "(" Prop ("," Prop)* ")")        --tag

  Prop = PropTag                               --tag
      |  Children                              --children
      |  ""                                    --empty
  Children = "#" Tag
  PropTag = propName "=" propValue
  propName = letter+
  propValue = alnum+
  name = letter+
  text = (alnum | space)+
}`;

// Criação da gramática
const myGrammar = ohm.grammar(grammar);

// Criação da semântica
const semantic = myGrammar.createSemantics();

const userInput = inputs;

// Verifica qual operação deve ser utilizada através do values passado como parâmetro 
function validationAndReduce(values, oneResult, reduce) {
  if(values.length == 0) {
    return "";
  } else if (values.length == 1) {
    return oneResult(values);
  } else {
    return reduce(values);
  }
}

// Cria o código da tag HTML
function createTag(tagName, propsTag, children) {
  var html = "<" + tagName + " "; //  Open tag
  var props = "";

  // Gerando os atributos/ propriedades da tag
  props = validationAndReduce (
    propsTag,
    (values) => values[0].propName + "=\"" + values[0].propValue + "\"",
    (values) => values.reduce((acc, curr) => {
      return acc.propName + "=\"" + acc.propValue + "\" " + curr.propName + "=\"" + curr.propValue + "\"";
    })
  );

    html += props;
  
if(children.length > 0) {
    const r = converteTreeToCode({exp: children});

    html += ">\n";
    html += r.html;
    html += "</" + tagName + ">\n"; // Close tag
  } else {
    html += "></" + tagName + ">\n"; // Close tag
  }
  
  return { html };
}

// Converte a Árvore em código
function converteTreeToCode(tree) {
  const expressions = tree.exp; // Array de Expressões
  var html = "";
  
  
  expressions.map(exp => {
    const tag = exp.tag;
    var propsTag = [],   
        children = [];
    
    if (!tag.name) {
      html += tag + '\n';
      return;
    }

    exp.props.map(prop => {
      if (prop.propTag) propsTag.push(prop.propTag)
      if (prop.child) children.push(prop.child)
    });

    const r = createTag(tag.name, propsTag, children);

    html += r.html;
  });

  return { html };
}

function verificarEGerarCodigo(input) {
  const result = myGrammar.match(input);

  if (result.failed()) { // Verifica se há erros
    console.log("Erro!!! Entrada inválida!\n");
    console.log(result.message);
    console.log("\n");
    return; // Para a execução
  } 

  if (result.succeeded()){
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
    Prop_children(ch) { return {child: ch.toTree() }},
    Prop_empty(e) { return; },
    Prop(e) { return e.toTree() },
    Children(c, t) { return t.toTree() },
    PropTag(pn, v, pv) { return { propName: pn.toTree(), propValue: pv.toTree() }},
    propName(_) { return this.sourceString; },
    propValue(_) { return this.sourceString; },
    name(_) { return {name: this.sourceString}; },
    text(_) { return this.sourceString; },
    _terminal() { return this.primitiveValue; }
  });
  }

  // Gera a árvore semântica do resultado
  const tree = semantic(result).toTree();

  // Criação dos arquivos para o código HTML
  const code = converteTreeToCode(tree);
  const html = new Uint8Array(Buffer.from(code.html));
  
  // Criação o arquivo html.txt
  fs.writeFile('src/generated/html.html', html, (err) => {
    if (err) throw err;
    console.log('Arquivo html criado com sucesso!\nDiretório: "src/generated/html.html"\n');
  });
}

verificarEGerarCodigo(userInput);