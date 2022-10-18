'use strinct'

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

// Cria o código da tag HTML e suas funções
function createTag(tagName, propsTag, restrictions, children) {
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

  props = props + " ";
  
    html += props;
  
  if (restrictions.includes("nocontent")) {
    html += " />\n";
  } else if(children.length > 0) {
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
export function converteTreeToCode(tree) {
  const expressions = tree.exp; // Array de Expressões
  var html = "";
  
  expressions.map(exp => {
    const tag = exp.tag;
    var propsTag = [], 
        restrictions = [],  
        children = [];
    
    if (!tag.name) {
      html += tag + '\n';
      return;
    }

    exp.props.map(prop => {
      if (prop.propTag) propsTag.push(prop.propTag)
      if (prop.restriction) restrictions.push(prop.restriction)
      if (prop.child) children.push(prop.child)
    });

    const r = createTag(tag.name, propsTag, restrictions, children);

    html += r.html;
  });

  return { html };
}