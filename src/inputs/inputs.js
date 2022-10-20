'use strict'

const inputs = `
table(
  id=table1,
  class=tableOne,
      #tr(
          id=trTeste1,    
              #td(
                  id = tdTesteTd1
              ),
              #td(
                  id = tdTesteTd2
              )
      ),
      #tr(
        id=trTeste2,    
            #td(
                id = tdTesteTd3
            ),
            #td(
                id = tdTesteTd4
            )
    ), #tr(
        id=trTeste3,    
            #td(
                id = tdTesteTd5
            ),
            #td(
                id = tdTesteTd6
            )
    ), #tr(
        id=trTeste4,    
            #td(
                id = tdTesteTd7
            ),
            #td(
                id = tdTesteTd8
            )
    ),
    #tr(
        id=trTeste5,    
            #td(
                id = tdTesteTd9
            ),
            #td(
                id = tdTesteTd10
            )
    )
)
`;

export default inputs;