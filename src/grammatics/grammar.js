'use strinct'

const grammar = `Grammar {
  Exp = Tag ("\\n"? Tag)*
  Tag = ("(" text ")")                         --text
      | (name "(" Prop ("," Prop)* ")")        --tag

  Prop = PropTag                               --tag
      |  restriction                           --restrict
      |  Children                              --children
      |  ""                                    --empty
  Children = "#" Tag
  PropTag = propName "=" propValue
  propName = letter+
  propValue = alnum+
  name = letter+
  text = (alnum | space)+
  restriction = "nocontent"
}`;

export default grammar;