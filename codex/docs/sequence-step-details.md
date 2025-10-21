# Guide detaille des steps Convertigo

Ce document decrit chaque step disponible dans une sequence Convertigo, avec les parametres configurables et les effets attendus. Les cles YAML correspondent a la valeur a utiliser dans `[]` lors de l edition du projet shrinke.

## Table des matieres

- [Flux et orchestration](#flux-et-orchestration)
- [Integration Convertigo](#integration-convertigo)
- [Sources et scripting (JS)](#sources-et-scripting-js)
- [Donnees JSON](#donnees-json)
- [Donnees XML](#donnees-xml)
- [Fichiers et systemes](#fichiers-et-systemes)
- [Session et contexte](#session-et-contexte)
- [Utilitaires](#utilitaires)

## Flux et orchestration

### IfExist (`steps.IfExistStep`)

- **Resume** : Defines an IF conditional step looking for node(s) on a source. The IfExist step is one of Convertigo Sequencer conditional steps. This step contains other steps executed only if the source defined through the Source property exists. Note: In Convertigo Studio, when an IfExist step is created in a sequence, it can be easily replaced by an IfExistThenElse , using the right-click menu on the step and choosing the option Change to > IfExistThenElse . The Source property remains the same and the steps present in the IfExist are moved to the Then sub-step.
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### IfExistThenElse (`steps.IfExistThenElseStep`)

- **Resume** : Defines an IF...THEN...ELSE... conditional step looking for node(s) on a source. The IfExistThenElse step is one of Convertigo Sequencer conditional steps. This step contains two child steps ( Then and Else ) which are executed depending on whether the source defined through the Source property exists or not: - Then step and child steps are executed when the specified source exists. - Else step and child steps are executed when the specified source does not exist. Note: In Convertigo Studio, when an IfExistThenElse step is created in a sequence, it can be easily replaced by an IfExist , using the right-click menu on the step and choosing the option Change to > IfExist . The Source property remains the same and the steps present in the sub-steps are: - steps present in the Then step are moved to the IfExist , - steps present in the Else step are deleted.
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### IfFileExists (`steps.IfFileExistStep`)

- **Resume** : Defines an IF conditional step looking for the existence of a file or a directory. The IfFileExists step is one of Convertigo Sequencer conditional steps. This step contains other steps executed only if the file or directory defined through the Source property exists. Note: In Convertigo Studio, when an IfFileExists step is created in a sequence, it can be easily replaced by an IfFileExistsThenElse , using the right-click menu on the step and choosing the option Change to > IfFileExistsThenElse . The Source property remains the same and the steps present in the IfFileExists are moved to the Then sub-step.
- **Parametres** :
  - Source : Defines the path of the file or directory which existence has to be checked. This property is a JavaScript expression that is evaluated during the sequence execution and gives the path of the file or directory which existence has to be checked. This path is either absolute or relative to Convertigo environment. Relative paths starting with: - ./ are relative to Convertigo workspace, - .// are relative to current project folder.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### IfFileExistsThenElse (`steps.IfFileExistThenElseStep`)

- **Resume** : Defines an IF...THEN...ELSE... conditional step looking for the existence of a file or a directory. The IfFileExistsThenElse step is one of the Convertigo Sequencer conditional steps. This step contains two child steps ( Then and Else ) which are executed depending on whether the file or directory defined through the Source property exists or not: - Then step and child steps are executed when the source file or directory exists. - Else step and child steps are executed when the source file or directory does not exist. Note: In Convertigo Studio, when an IfFileExistsThenElse step is created in a sequence, it can be easily replaced by an IfFileExists , using the right-click menu on the step and choosing the option Change to > IfFileExists . The Source property remains the same and the steps present in the sub-steps are: - steps present in the Then step are moved to the IfFileExists , - steps present in the Else step are deleted.
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### IfIsIn (`steps.IsInStep`)

- **Resume** : Defines an IF conditional step looking for matches on a source. The IfIsIn step is one of Convertigo Sequencer conditional steps. This step is based on a source and one or more regular expression(s) called "Tests". Child steps are executed only if the specified source exists and if tests match on that specified source. Note: In Convertigo Studio, when an IfIsIn step is created in a sequence, it can be easily replaced by an IfIsInThenElse , using the right-click menu on the step and choosing the option Change to > IfIsInThenElse . The Source and Tests properties remain the same and the steps present in the IfIsIn are moved to the Then sub-step.
- **Parametres** :
  - Tests : Defines match tests as regular expressions. This property allows to define a list of tests that are applied on the source result. For each test, two elements have to be set: - Operator : value to choose between AND and NOT , the operator value is applied on the regular expression result to keep it ( AND ) or to inverse it ( NOT ). - Regular exp : defines a regular expression to apply (inverted or not thanks to operator value) on the source result. Note: - A new test can be added to the list using the blue keyboard icon. The tests defined in the list can be ordered using the arrow up and arrow down buttons, or deleted using the red cross icon. - In order to be able to test the regular expressions on the source result, the defined source has to select a text node. - For more information about regular expression patterns, see the following page: http://www.regular-expressions.info/reference.html . - To test regular expressions, you can use the regular expression tester at the following URL: http://www.regular-expressions.info/javascriptexample.html .
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### IfIsInThenElse (`steps.IsInThenElseStep`)

- **Resume** : Defines an IF...THEN...ELSE... conditional step looking for matches on a source. The IfIsInThenElse step is one of the Convertigo Sequencer conditional steps. This step is based on a source and one or more regular expression(s) called "Tests". This step contains two child steps ( Then and Else ) which are executed depending on whether the specified source exists and if tests match on that specified source or not: - Then step and child steps are executed when specified source exists and tests match on source, - Else step and child steps are executed when specified source exists and tests do not match on source or when specified source does not exist. Note: In Convertigo Studio, when an IfIsInThenElse step is created in a sequence, it can be easily replaced by an IfIsIn , using the right-click menu on the step and choosing the option Change to > IfIsIn . The Source and Tests properties remain the same and the steps present in the sub-steps are: - steps present in the Then step are moved to the IfIsIn , - steps present in the Else step are deleted.
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Iterator (`steps.IteratorStep`)

- **Resume** : Defines a loop step iterating on XML nodes result from a source. Also called For Each step, the Iterator step: - defines a source as input list to work on, i.e. a list of nodes from a previous step, used as a recurring element (for example table rows), - iterates on each element of the specified source, - contains child steps that are executed on each iteration, as other loop steps (for example, see " jIterator ", " jWhile " and " jDoWhile " steps documentation and examples). In the iteration, child steps can access and use the current iterated element: - using a source pointing on the Iterator step itself, - using the JavaScript variable named item , which is a Java Node object (item of the NodeList resulting from the input source). They also can access the current iteration index using the JavaScript variable named index updated on each iteration, which is an integer. Note: The current item value can be accessed using the following code statement: - item.getTextContent() if the Node is of Text or Attribute type, - item.getNodeValue() if the Node is of Element type.
- **Parametres** :
  - Stopping index : Defines the exclusive index to which the Iterator should stop to iterate. Intended mostly for testing purposes, this (optional) parameter limits the number of times the iterator loops if this last index is reached. This property is a JavaScript expression that is evaluated during the sequence execution. By default, it is not filled, so the Iterator loops on each node from the source.
  - Source : Defines the source list to iterate on. This property allows defining a list of nodes from a previous step on which current step works. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. If the XPath doesn't match or if the source is left blank, the step has no data to work on: the loop does not execute its child steps and the parent sequence execution continues.
  - Starting index : Defines the index from which the Iterator should start to iterate. In the case you do not want to start an iteration at the first item (index 0 ), you can specify a starting index in this property. This property is a JavaScript expression that is evaluated during the sequence execution. By default, it is set to 0 for starting at the first item of the source list. If the defined starting index does not exist in the source list, the loop does not execute its child steps and the parent sequence execution continues.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Parallel (`steps.ParallelStep`)

- **Resume** : Defines a step executing child steps in parallel. A Parallel step executes steps simultaneously in parallel contexts. The maximum number of contexts is set by the value of the Max. threads property. Each child step is executed in a dedicated thread. When a child thread is completed, all of its resources are released. As a consequence, a step defined outside a Parallel step cannot source any information from it. To do so, it is recommended that you: - create a Complex step as a parent of the Parallel step, - generate information from the Parallel step into the Complex step, - use the Complex step as a source outside the Parallel step. A Parallel step is completed (i.e. the sequence will continue flow execution) when all child threads have been completed. This means the step following a Parallel step starts right after all child threads have been completed. Convertigo contexts are created for each child step executed in parallel. These contexts are automatically named after parent Parallel step properties. If Call transaction or Call sequence steps are child of a Parallel step, contexts can be named after their Context property or automatically if this property is not specified. Every automatically named context will be deleted after the Parallel step execution is completed. Explicitly named contexts will remain for further transaction or sequence use.
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Return (`steps.ReturnStep`)

- **Resume** : Defines a RETURN step. A Return steps exits the current sequence in which it is positioned.
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Serial (`steps.SerialStep`)

- **Resume** : Defines a step executing child steps in series. All child steps of a Serial step are executed one after another, it is similar to the basic behavior of step execution when they are positioned just under the parent Generic Sequence . A Serial step is completed (i.e. the sequence will continue flow execution) when all child steps have been completed. This means the step following a Serial step starts right after the last child step is completed.
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### jBreak (`steps.BreakStep`)

- **Resume** : Defines a BREAK step. A jBreak step executes a JavaScript expression and exits the current loop step.
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### jDoWhile (`steps.DoWhileStep`)

- **Resume** : Defines a DO...WHILE loop step based on a JavaScript condition. This step executes a group of child steps once, then repeats execution of the loop until the condition expression set in the Condition property is found to be false. Note: You can add other steps to this step: these are the steps executed in the loop.
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### jElse (`steps.ElseStep`)

- **Resume** : Defines an Else step.
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### jFunction (`steps.FunctionStep`)

- **Resume** : Defines a FUNCTION step.
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### jIf (`steps.IfStep`)

- **Resume** : Defines an IF conditional step based on a JavaScript condition. The jIf step is one of Convertigo Sequencer conditional steps. This step is based on a JavaScript condition and contains other steps executed only if the condition is fulfilled. The condition, defined in the Condition property, is a JavaScript expression that is evaluated during the sequence execution as true or false . If the condition is considered true , then steps under the parent jIf step are executed. If the condition is considered false , the steps under the parent jIf step are not executed. Note: In Convertigo Studio, when an jIf step is created in a sequence, it can be easily replaced by an jIfThenElse , using the right-click menu on the step and choosing the option Change to > jIfThenElse . The Condition property remains the same and the steps present in the jIf are moved to the Then sub-step.
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### jIfThenElse (`steps.IfThenElseStep`)

- **Resume** : Defines an IF...THEN...ELSE... conditional step based on a JavaScript condition. The jIfThenElse step is one of the Convertigo Sequencer conditional steps. This step is based on a JavaScript condition and contains two child steps ( Then and Else ) which are executed depending on the condition fulfillment: - Then step and child steps are executed when the condition is verified, - Else step and child steps are executed when the condition is not verified. The condition, defined in the Condition property, is a JavaScript expression that is evaluated during the sequence execution as true or false . Note: In Convertigo Studio, when an jIfThenElse step is created in a sequence, it can be easily replaced by an jIf , using the right-click menu on the step and choosing the option Change to > jIf . The Condition property remains the same and the steps present in the sub-steps are: - steps present in the Then step are moved to the jIf , - steps present in the Else step are deleted.
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### jIterator (`steps.SimpleIteratorStep`)

- **Resume** : Defines a loop step iterating on list items result from a JavaScript expression. Also called For Each step, the jIterator step: - defines a JavaScript expression as input list to work on, i.e. the name of a multi-valued variable, the name of a defined JavaScript Array, or the name of a NodeList variable created by a previous jSource step, etc., - iterates on each item of the specified input list, - contains child steps that are executed on each iteration, as other loop steps (for example see " Iterator ", " jWhile " and " jDoWhile " steps documentation and examples). In the iteration, child steps can access and use: - the current iterated item through a JavaScript variable named item , which type depends on the iterated Array or NodeList, - the current iteration index through a JavaScript variable named index , which is an integer.
- **Parametres** :
  - Stopping index : Defines the exclusive index to which the Iterator should stop to iterate. Intended mostly for testing purposes, this (optional) parameter limits the number of times the iterator loops if this last index is reached. By default, it is not filled, so the jIterator loops on each item from the list.
  - Expression : Defines the expression evaluated to give the list to iterate on. This property is a JavaScript expression that is evaluated during the sequence execution and gives a list of items (JavaScript Array or NodeList ). If the expression doesn't output a list object or if the expression is left blank, the step has no data to work on: the loop does not execute its child steps and the parent sequence execution continues.
  - Starting index : Defines the index from which the jIterator should start to iterate. In the case you do not want to start an iteration at the first item (index 0 ), you can specify a starting index in this property. This property is a JavaScript expression that is evaluated during the sequence execution. By default, it is set to 0 for starting at the first item of the input list. If the defined starting index does not exist in the input list, the loop does not execute its child steps and the parent sequence execution continues.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### jThen (`steps.ThenStep`)

- **Resume** : Defines a Then step.
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### jWhile (`steps.WhileStep`)

- **Resume** : Defines a WHILE loop step based on a JavaScript condition. This step executes a group of child steps as the condition expression set in the Condition property remains true. Note: You can add other steps to this step: these are the steps executed in the loop.
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

## Integration Convertigo

### Call Sequence (`steps.SequenceStep`)

- **Resume** : Defines a step invoking a sequence. The Call Sequence step enables to call any existing sequence from the same project or another. It provides input variables to the target sequence, and returns XML data from the call. Variables to be used for the call must be described at step level by adding Variables child objects. You can manually set variables or use the Import variables from the target sequence contextual menu to automatically copy the variable definitions from the target sequence. The target sequence returns structured XML data, its XML schema has to be generated while developing the sequence and is automatically imported to the Call Sequence step while configuring its Sequence property. Thus, the sequence's schema is known by the calling step and elements from the sequence result can be correctly sourced from it. Note: - A Call Sequence step with all its properties filled and including the target variables can be easily created at once in the Convertigo Studio Projects view. To do so, drag-and-drop with Ctrl key pressed a sequence from its parent project to a sequence or a block step where the Call Sequence step has to be created. - The client/server HTTP session of parent sequence is spread to the called sequence context, even if it is called internally ( Internal invoke property set to true ).
- **Parametres** :
  - Inherit context : Defines whether the context used by the current sequence for transaction's steps should also be used by the target sequence. Sequences are executing all child transactions (transactions called thanks to Call transaction steps) in a context automatically created (except for transactions called thanks to a Call transaction step with Context property set). For other child transactions, the automatically created context can be passed to a child sequence (called thanks to a Call Sequence step) for it to re-use this context for executing its child transactions. To do so, set this property to true .
  - Sequence : Defines the target project and sequence to request from this project. The target sequence must be one of the sequences from an existing project, the project in which the Call Sequence step is added or another project opened in the same Convertigo. This property is set by selecting the target sequence in a list of values of the following form: . to avoid mistakes in case of sequences with the same name in several projects.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Call Transaction (`steps.TransactionStep`)

- **Resume** : Defines a step invoking a transaction. The Call Transaction step enables to call any existing transaction from the same project or another. It provides input variables to the target transaction, and returns XML data from the call. Variables to be used for the call must be described at step level by adding Variables child objects. You can manually set variables or use the Import variables from the target transaction contextual menu to automatically copy the variable definitions from the target transaction. The target transaction returns structured XML data, its XML schema has to be generated while developing the transaction and is automatically imported to the Call Transaction step while configuring its Transaction property. Thus, the transaction's schema is known by the calling step and elements from the transaction result can be correctly sourced from it. Note: - A Call Transaction step with all its properties filled and including the target variables can be easily created at once in the Convertigo Studio Projects view. To do so, drag-and-drop with Ctrl key pressed a transaction from its parent connector to a sequence or a block step where the Call Transaction step has to be created. - The client/server HTTP session of parent sequence is spread to the called transaction context, even if it is called internally ( Internal invoke property set to true ).
- **Parametres** :
  - Connection string : Replaces the connection parameters of target connector. The connection string represents different data depending on connector type: - HTTP / HTML connector : replaces the connector URL string made up of the connector's Server name, server Port , Root path and transaction's Sub path properties. - Javelin connector : replaces the address set in the Connection address property, made up of Connection parameter , Host name , host Port and Connection type sub properties.
  - Transaction : Defines the target project, connector from this project and transaction to request. The target transaction must be one of the transactions of one of the connectors from an existing project, the project in which the Call Sequence step is added or another project opened in the same Convertigo. This property is set by selecting the target transaction in a list of values of the following form: . . to avoid mistakes in case of transactions with the same name in several projects.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

## Sources et scripting (JS)

### JsonSource (`steps.JsonSourceStep`)

- **Resume** : Defines a step extracting a JSON typed XML structure from a source into a variable in Javascript scope. The JsonSource step uses the source defined in the Source property, parses it as JSON and sets a JavaScript variable in the current executed sequence JavaScript scope. This variable contains a JS Object or a JS Array . The variable is named after the Variable name property value. It exists while the sequence is running. If no node matches, the variable is null .
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Sequence JS (`steps.SimpleStep`)

- **Resume** : Defines a scripting step. This helpful step allows to handle JavaScript code that will be executed in the sequence scope. This JavaScript code is able to: - initialize variables, - perform complex calculations, - access the context object to get useful properties such as contextID , httpSession , isCacheEnabled , lockPooledContext , etc., - use some context methods to manipulate the result XML DOM, encode and decode data, abort sequence, etc.
- **Parametres** :
  - Expression : Defines the expression evaluated to give the step value. This property is a JavaScript expression that is evaluated during the sequence execution and gives the step's result.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### jException (`steps.ExceptionStep`)

- **Resume** : Raises a Convertigo Engine exception. In some circumstances, it is necessary to explicitly raise a Convertigo Engine exception. This is reflected as a SoapFaultException for SOAP web service callers or by an error structure in XML output for any other caller. Message and Details properties can be set to complex JavaScript expressions, mixing text strings and data from variables. These expressions are evaluated during the sequence execution and build a dynamic message and details output in the raised exception. The error XML structure contains a type attribute, which value is automatically set to c8o in case of Exception. It allows to differentiate an irrecoverable Server error from a project/applicative error created using an Error step ( type attribute value is then project ). A jException step breaks the sequence execution flow, the sequence ends just after this step's execution (contrary to Error step which does not break the execution flow).
- **Parametres** :
  - Details : Provides additional details about the triggered error. This property allows the developer to dynamically add some details content in the raised Exception, depending on the sequence execution.
  - Message : Provides the (humanly readable) error message. This property allows the developer to dynamically define the message text of the raised Exception, depending on the sequence execution.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### jSimpleSource (`steps.SimpleSourceStep`)

- **Resume** : Defines a step extracting a string from a source into a variable in Javascript scope. The jSimpleSource step gets a single node from the source defined in the Source property and sets a JavaScript variable in the current executed sequence JavaScript scope. This variable contains a String . The variable is named after the Variable name property value. It exists while the sequence is running. If no node matches, the variable is null .
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### jSource (`steps.SourceStep`)

- **Resume** : Defines a step extracting a list of nodes from a source into a variable in JavaScript scope. The jSource step gets a list of nodes from the source defined in the Source property and sets a JavaScript variable in the current executed sequence JavaScript scope. This variable contains a Java NodeList object, i.e. a list of XML nodes get from the source. The variable is named after the Variable name property value. It exists while the sequence is running. If only one node matches, the variable is also a NodeList containing only one Node (index is 0). If no node matches, the variable is finally an empty NodeList , containing no Node ( var_name.getLength() = 0 ). Note: - The variable contains a list of node elements get from a previously executed step. To access one ( Node ) of the list, use the following syntax in a step: var_name.item(index) . - To access one element's text content ( String ), use the element.getTextContent() method, to retrieve the text of the element, or the element.getNodeValue() method, which result depends on the node type (will extract a text only if the Node is of Text or Attribute type).
- **Parametres** :
  - Source : Defines the source to extract. This property allows defining a list of nodes from a previous step that are set in a JavaScript variable, as described in the main description of this step. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. If the XPath doesn't match or if the source is left blank, depending on the step, the variable is created: - as an empty NodeList with no data (for jSource step), - null (for jSimpleSource step).
  - Variable name : Defines the name of the JavaScript variable. If this variable exists in scope, its value is overridden. If the variable doesn't exist in scope, it is created.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

## Donnees JSON

### Array (`steps.JsonArrayStep`)

- **Resume** : Creates an XML element ready to output a JSON Array. The Array step adds an element node ready to output a JSON Array. The element resulting from this step can be output in the response of the sequence if the Output property is set to true , or used as a source by any other following step. Array will be inserted to its Object parent using the key property as JSON key. Its value is set thanks to a source defined in Source property. If no source is defined or if its results is empty, the XML element contains the value of the Default value property, if a value is defined in this property. Note: - Other JSON Child steps can be added under this step to create a data structure.
- **Parametres** :
  - Key : Defines the key name used for its Object parent owner. This property is a "smart type" property, that allows to specify the key. A "smart type" property can be of one of the following types: - a text : the value is therefore a hard-coded text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. Note: - If you use the source type for this property, the XPath application on target should give a text result. Otherwise, the first node's text content is taken.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Field (`steps.JsonFieldStep`)

- **Resume** : Creates a JSON base type. The Field step adds a JSON string, number, boolean or null. The element resulting from this step can be output in the response of the sequence if the Output property is set to true , or used as a source by any other following step. Field will be inserted to its Object parent using the key property as JSON key. Its value is set thanks to a source defined in Source property. If no source is defined or if its results is empty, the element contains the value of the Default value property, if a value is defined in this property.
- **Parametres** :
  - Key : Defines the key name used for its Object parent owner. This property is a "smart type" property, that allows to specify the key. A "smart type" property can be of one of the following types: - a text : the value is therefore a hard-coded text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. Note: - If you use the source type for this property, the XPath application on target XML should give a text result. Otherwise, the first node's text content is taken.
  - Type : Defines the type for the value JSON transformation. This property defines string as default type. This value can be updated. Possible type values are the following: - string , - number , - boolean , - null .
  - Value : Defines the expression evaluated to give the text to output. This property is a "smart type" property, that allows to specify the key. A "smart type" property can be of one of the following types: - a text : the value is therefore a hard-coded text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. Note: - If you use the source type for this property, the XPath application on target XML should give a text result. Otherwise, the first node's text content is taken.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### JSON to XML (`steps.JsonToXmlStep`)

- **Resume** : Creates an XML attribute node based on a JavaScript expression. The JSON to XML step adds an typed XML structure node to the parent generated XML element in the sequence XML output. The resulting from this step can be output in the response XML of the sequence if the Output property is set to true , or used as a source by any other following step.
- **Parametres** :
  - Array children TagName : Defines TagName used to describe elements under a JSON array.
  - JSON Object : Defines an object from the JS scope or parse a JSON String that will be transformed to an XML typed structure. This property is a "smart type" property, that allows to specify the key. A "smart type" property can be of one of the following types: - a text : the value is therefore a hard-coded text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. Note: - If you use the source type for this property, the XPath application on target XML should give a text result. Otherwise, the first node's text content is taken.
  - JSON Sample : Defines a sample of the expected JSON, used to extract the schema of the response.
  - Key : Defines the key name used for its Object parent owner. This property is a "smart type" property, that allows to specify the key. A "smart type" property can be of one of the following types: - a text : the value is therefore a hard-coded text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. Note: - If you use the source type for this property, the XPath application on target XML should give a text result. Otherwise, the first node's text content is taken.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Object (`steps.JsonObjectStep`)

- **Resume** : Creates an JSON Object. The Object step adds an JSON Object. The element resulting from this step can be output in the response of the sequence if the Output property is set to true , or used as a source by any other following step. Object will be inserted to its Object parent using the key property as JSON key. Its value is set thanks to a source defined in Source property. If no source is defined or if its results is empty, the element contains the value of the Default value property, if a value is defined in this property. Note: - Other Child steps can be added under this step to create a data structure. The key property of children step is used for the JSON key.
- **Parametres** :
  - Key : Defines the key name used for its Object parent owner. This property is a "smart type" property, that allows to specify the key. A "smart type" property can be of one of the following types: - a text : the value is therefore a hard-coded text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. Note: - If you use the source type for this property, the XPath application on target XML should give a text result. Otherwise, the first node's text content is taken.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

## Donnees XML

### Attribute (`steps.XMLAttributeStep`)

- **Resume** : Creates an XML attribute node. The Attribute step adds an attribute node to parent generated XML element in the sequence XML output. The XML attribute resulting from this step can be output in the response XML of the sequence if the Output property is set to true , or used as a source by any other following step. The attribute is named after the value of the Node name property, its value is set thanks to a source defined in Source property. If no source is defined or if its results is empty, the XML attribute contains the value of the Default value property, if a value is defined in this property. Note: - An Attribute step can only be added under Element steps, jElement steps and Complex steps. - No step can be added under an Attribute step.
- **Parametres** :
  - Node name : Defines the name of the generated XML attribute. This property can contain any name, no words are reserved, and must follow the rules on XML naming: - it can contain letters, numbers, and other characters, - it cannot start with a number, - it cannot contain spaces nor punctuation character.
  - Attribute namespace : Defines the namespace to use for this attribute. Leave it blank for no namespace.
  - Attribute namespace URI : Defines the URI associated with the namespace. Leave it blank for no namespace.
  - Default value : Defines the default text value of the attribute. This property allows defining a default value to use when no source is defined or when the source result is empty.
  - Source : Defines the source to use as value. This property allows defining a node or a list of nodes from a previous step used by current step as value. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. If the XPath doesn't match or if the source is left blank, the step uses the value defined in Default value property, if a value is defined in this property. Otherwise, the step creates an empty attribute.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Complex (`steps.XMLComplexStep`)

- **Resume** : Defines an empty XML element (with no text content). The Complex step generates an output XML tag and can contain other steps generating XML (for example: Element , Attribute or Complex steps) in order to create any XML structure. This structure can be output in the response XML of the sequence if the Output property is set to true , or used as a source by any other following step. Note: Child steps have to be added under this step to create a data structure.
- **Parametres** :
  - Node name : Defines the tag name of the generated XML element. This property can contain any name, no words are reserved, and must follow the rules on XML naming: - it can contain letters, numbers, and other characters, - it cannot start with a number, - it cannot contain spaces nor punctuation character.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Concat (`steps.XMLConcatStep`)

- **Resume** : Concatenates defined sources. Concat steps are used to concatenate string elements into one new resulting XML element inserted in the output. The Concat step uses an array of input strings (set using the Sources property) to be concatenated. An optional Separator parameter can also be added. If used, the separator is inserted in the resulting string between each concatenated element. The resulting string is added to the sequence XML output and can be used as a new source for other steps. Note: In Convertigo Studio, when a Concat step is created in a sequence, it can be easily replaced by an Element step, using the right-click menu on the step and choosing the option Change to > Element . - The Node name property remains the same. - The first source filled in the Concat step is moved to the Source property of the Element step. - Default value properties defined in Concat step lines are concatenated and moved to the Default value property of the Element step.
- **Parametres** :
  - Separator : Defines the text to be used as a separator string. If set, this text is added between each text to concatenate. Default value is a white space, think about removing it if you do not want to use it.
  - Sources : Defines a list of source items to use as values. This property allows defining a list of source items that are used to create the result value. Each source item contains three columns to be set: - Description : Defines a comment or description about this source item. - Source : Defines the source. A source is a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. - Default value : Defines the default value for this source. If the source's XPath doesn't match in the referenced step or if the source is left blank, the default value is used. Otherwise, the source item creates no data. Each source item may define a source and a default value. Note: A new source item can be added to the list using the blue keyboard icon. The source items defined in the list can be ordered using the arrow up and arrow down buttons, or deleted using the red cross icon.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Copy (`steps.XMLCopyStep`)

- **Resume** : Imports a copy of XML elements sourced from a previous step. The Copy step duplicates and imports a list of nodes from a previously executed step to the sequence XML output. The XML elements resulting from this step can be used as a source by another step. The list of nodes to duplicate is set thanks to a source defined in Source property.
- **Parametres** :
  - Source : Defines the source to copy. This property allows defining a list of nodes from a previous step that are copied by this step. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. If the XPath doesn't match or if the source is left blank, the step has no data to work on: nothing is copied in the sequence output.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Count (`steps.XMLCountStep`)

- **Resume** : Defines an XML element containing the number of nodes found. Count steps are used to count the nodes corresponding to the Xpath set up in the source. The resulting XML element is inserted in the XML output.
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Date/Time (`steps.XMLDateTimeStep`)

- **Resume** : Creates a datetime XML element from defined source(s). Date/Time steps are used to convert dates into various formats. The resulting XML element is inserted in the output. If dates do not match format and locale properties, the result is the concatenation of input sources.
- **Parametres** :
  - Source(s) format : Defines the date format of source(s). For more information on usable symbols, see Appendix " Date format - Usable symbols ".
  - Source(s) locale : Defines the locale of source(s). If the source date contains text, make sure to properly set this property. If not, the date will not be recognized. For example, if this property is set to FR with a source date being 09-September-2009 , the source date will neither be recognized nor converted.
  - Format : Defines the resulting date format. For more information on usable symbols, see Appendix " Date format - Usable symbols ".
  - Locale : Defines the resulting date locale. This property defines the resulting date locale. Text is formatted depending on this property. For example, if the date is 09/09/2009 , the resulting MMMM format: - with the Locale property set to US is September , - with the Locale property set to FR is septembre .
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Element (`steps.XMLElementStep`)

- **Resume** : Creates an XML element with a text content. The Element step adds an element node with text content to parent generated XML element in the sequence XML output. The XML element resulting from this step can be output in the response XML of the sequence if the Output property is set to true , or used as a source by any other following step. The element is named after the value of the Node name property, its value is set thanks to a source defined in Source property. If no source is defined or if its results is empty, the XML element contains the value of the Default value property, if a value is defined in this property. Note: - Child steps can be added under this step to create a data structure. - In Convertigo Studio, when an Element step is created in a sequence, it can be easily replaced by a Concat step, using the right-click menu on the step and choosing the option Change to > Concat . The Node name property remains the same. The Source and Default value properties are moved to the Concat step as two lines of the list of source items to concat, one with a source defined and one with a default value defined.
- **Parametres** :
  - Node name : Defines the tag name of the generated XML element. This property can contain any name, no words are reserved, and must follow the rules on XML naming: - it can contain letters, numbers, and other characters, - it cannot start with a number, - it cannot contain spaces nor punctuation character.
  - Default value : Defines the default text value of the element. This property allows defining a default value to use when no source is defined or when the source result is empty.
  - Source : Defines the source to use as value. This property allows defining a node or a list of nodes from a previous step on which current step works. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. If the XPath doesn't match or if the source is left blank, the step uses the value defined in Default value property, if a value is defined in this property. Otherwise, the step creates an element with no data.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Error structure (`steps.XMLErrorStep`)

- **Resume** : Creates an XML structure describing an applicative error. The Error structure step generates an output XML structure corresponding to an applicative error. This structure is created on a standard basis (error code, message, details) that is automatically managed by client applications developed with Convertigo Mobilizer and/or using the Convertigo Templating Framework. The basic error structure elements are filled using the step's corresponding properties: Code , Message and Details . The structure can be enhanced with user-defined elements: to do so, simply add child steps under this Error structure step (the same way as for a Complex step). This error structure contains a type attribute, which value is automatically set to project . It allows to differentiate a project/applicative error from an irrecoverable Server error ( type attribute value is then c8o ). The error structure can be output in the response XML of the sequence if the Output property is set to true , or used as a source by any other following step. An Error structure step does not break the sequence execution flow (contrary to jException step for example). Use the Break or Return steps when you need to stop the sequence execution flow after an Error structure step.
- **Parametres** :
  - Code : A numeric error code to fill in error structure, identifying the error. This property is a "smart type" property, that allows to specify the error code. A "smart type" property can be of one of the following types: - a text : the value is therefore a hard-coded text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. Note: - If you use the source type for this property, the XPath application on target XML should give a text result. Otherwise, the first node's text content is taken. - If no error message text is defined by the Message property, the client project error dictionary can be used, if using the Internationalization framework, to retrieve the error message corresponding to this error code.
  - Details : Some technical information details about the error, to fill in error structure, mainly for debugging purposes. This property is a "smart type" property, that allows to specify the error details. A "smart type" property can be of one of the following types: - a text : the value is therefore a hard-coded text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. Note: If you use the source type for this property, the XPath application on target XML should give a text result. Otherwise, the first node's text content is taken.
  - Message : An optional text message to fill in error structure, explaining the error. This property is a "smart type" property, that allows to specify the error message. A "smart type" property can be of one of the following types: - a text : the value is therefore a hard-coded text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. Note: - If you use the source type for this property, the XPath application on target XML should give a text result. Otherwise, the first node's text content is taken. - If this error message text is not present in output, the client project error dictionary can be used, if using the Internationalization framework, to retrieve the error message corresponding to the error code defined by the Code property.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Generate dates (`steps.XMLGenerateDatesStep`)

- **Resume** : Creates a list of XML elements containing dates based on input definitions. Generate dates step is used to generate a list of dates. These dates are generated based upon Input properties. Depending on Split property value, resulting dates can be: - formatted, thanks to Output properties, into text in XML elements that are inserted in the sequence's XML output, - split in several pieces of information (day of week, day date, month, year) that are added into an XML structure inserted in the sequence's XML output.
- **Parametres** :
  - Java Calendar compatibility : Defines whether input/output properties values are compatible with the Java Calendar . If this property is set to false , the input/output properties values use traditional calendar notations: - weekdays go from 1 to 7, - months go from 01 to 12, - days go from 01 to 31. If this property is set to true , the input/output properties values use Java Calendar notations: - weekdays go from 1 to 7 (but order differs from traditional calendar, see the Input - Days of week property), - months go from 0 to 11, - days go from 1 to 31.
  - Input - Days of week : Defines the days of week. This property defines the days of the week which dates have to be generated. Days of week are defined by numbers which can take different values depending on the Java Calendar compatibility property: - for Java Calendar compatible format - M:2, T:3, W:4, T:5, F:6, S:7, S:1; - for classic format - M:1, T:2, W:3, T:4, F:5, S:6, S:7. Note: - For generating several days, separate days numbers by a comma ( "," ). For example: "2,3,4,5,6,7,1" to generate all days with Java Calendar compatibility property to true . - The order of defined days numbers does not impact the dates generation. For example: "2,3,4,5,6,7,1" and "5,2,6,4,3,7,1" values give the same output result dates.
  - Input - Format : Defines the input dates format. Input dates text must be formatted depending on this property. For example, if dates are entered in the following form: 09/09/2009 , the Input - Format property can be set to: - MM/dd/yyyy , with the Input - Locale property set to US , - dd/MM/yyyy , with the Input - Locale property set to FR . For more information on usable symbols, see Appendix " Date format - Usable symbols ".
  - Input - Locale : Defines the input dates locale. Input dates text must be formatted depending on this property. For example, with the Input - Format property set to dd MMMM yyyy , the Input - Locale property can be set to: - US , if entered dates look like 09 September 2009 , - FR , if entered dates look like 09 septembre 2009 .
  - Output - Format : Defines the dates output format in " no split " case. This property defines the resulting date format when dates are generated as texts (see Split property description). In this case, text of generated dates is formatted depending on Output - Format property. For example, if the Output - Format property is set to yyyy MM dd , the 09/09/2009 resulting date would be written: 2009 09 09 . For more information on usable symbols, see Appendix " Date format - Usable symbols ".
  - Output - Locale : Defines the dates output locale in " no split " case. This property defines the resulting date locale when dates are generated as texts. Text is formatted depending on this property. For example, if the date is 09/09/2009 and the resulting Output - Format property is set to MMMM , the resulting date would be written: - "September", with the Output - Locale property set to US , - "septembre", with the Output - Locale property set to FR .
  - Split : Defines whether dates should be split into several pieces of data or written as text. If this property is set to false (i.e. " no split " format), each generated date is created with the following format: date into Output format format . If this property is set to true (i.e. " split " format), each generated date is created with the following format: value of dayOfWeek value of day value of month value of year/year>.
  - Input - Start date : Defines the start date using Input - format property value format. This property defines the date from which dates are generated (day included).
  - Input - End date : Defines the end date using Input - format property value format. This property defines the date to which dates are generated (day included).
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Sort (`steps.XMLSortStep`)

- **Resume** : Sorts XML nodes from a source using a sort key defined by an XPath. The Sort step works as follows: - It defines an input list to work on using a source, i.e. a list of nodes to be sorted from a previous step. - It applies a common XPath on each item of the list to define a sort key for this node. The XPath is defined in the Sort key XPath property. The result of this XPath applied on each item of the list is the sort key. This sort key is the value that can actually be sorted (by number, by alphabetical order, etc.) and used to sort the matching nodes. - It uses the sort keys to sort the nodes of the list, using options defined in other properties ( Sort order , Sort type and Sort options ). - It finally outputs the sorted nodes, so they can be used as source by a following step or output by the Sequence .
- **Parametres** :
  - Sort option : Defines some options to sort the sort key, depending on their type. Depending on the Sort type property value, this property contains options that are needed to make the comparison. For Date sort type (sort keys of date type), this property must contain the sort keys date format. For more information on usable symbols, see Appendix " Date format - Usable symbols ".
  - Sort order : Defines the sorting order. This property allows to define the sorting order. It can take the following values: - Ascending : the sort is performed by ascending order, - Descending : the sort is performed by descending order.
  - Sort key XPath : The XPath that is applied on each node of the list to define its sort key. This property allows to define the XPath that will be applied on each node of the source list to give the sort key of the node. The sort key of each node of the list is then used for sorting the list: each node is represented by its sort key during the sort algorithm.
  - Source : Defines the list of nodes to sort using a source. This property allows defining a list of nodes from a previous step on which current step works, i.e. the items to sort. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. If the XPath doesn't match or if the source is left blank, the step has no data to work on: the list of objects to sort is empty, nothing is sorted and the parent sequence execution continues.
  - Sort type : Defines on which data type the sort is performed. This property allows to define on which data type the sort is performed. It can take the following values: - String : the sort keys are of string type, the sort is performed by alphabetical order, - Number : the sort keys are of number type, the sort is performed by numerical order, - Date : the sort keys are of date type, the sort is performed chronologically, using the Sort option property to define the date format.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Split (`steps.XMLSplitStep`)

- **Resume** : Splits sourced text into XML elements. Split step helps breaking a sourced text around matches of the given separator. The resulting XML element contains a nodelist of founded values.
- **Parametres** :
  - Keep separator : Defines whether separators should be kept.
  - Separator : Defines the regular expression to be used as a separator.
  - Split tags : Defines the tags to be used for new elements. Each split element has a split tag container. If the Split tags table is filled with N elements, the first N split elements are named in the XML output after those elements. The others have a split tag container. If there are more tags in the table than split elements, tags without element are not added to the output. Note: A new tag can be added to the list using the blue keyboard icon. The tags defined in the list can be ordered using the arrow up and arrow down buttons, or deleted using the red cross icon.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Transform (`steps.XMLTransformStep`)

- **Resume** : Replaces regular expressions found in a source with other expressions. The resulting XML element is inserted in the sequence XML output.
- **Parametres** :
  - Replacements : Defines text replacements. Regular expressions are searched within the source and replaced by the value of the Replacements property. You can reuse the searched (and found) regular expression into the replacement, by typing $0 (= value of the found string) in the Replacement value. Note: A new replacement can be added to the list using the blue keyboard icon. The replacements defined in the list can be ordered using the arrow up and arrow down buttons, or deleted using the red cross icon.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### jAttribute (`steps.AttributeStep`)

- **Resume** : Creates an XML attribute node based on a JavaScript expression. The jAttribute step adds an attribute node to parent generated XML element in the sequence XML output. The XML attribute resulting from this step can be output in the response XML of the sequence if the Output property is set to true , or used as a source by any other following step. The attribute is named after the value of the Node name property, its value is set thanks to a JavaScript expression defined in Expression property. If the JavaScript expression is null, the XML attribute contains the value of the Default value property. Note: - A jAttribute step can only be added under Element steps, jElement steps and Complex steps. - No step can be added under a jAttribute step.
- **Parametres** :
  - Expression : Defines the expression evaluated to give the output text. This property is a JavaScript expression that is evaluated during the sequence execution and gives the text string to output in the generated attribute.
  - Node name : Defines the name of the generated XML attribute. This property can contain any name, no words are reserved, and must follow the rules on XML naming: - it can contain letters, numbers, and other characters, - it cannot start with a number, - it cannot contain spaces nor punctuation character.
  - Attribute namespace : Defines the namespace to use for this attribute. Leave it blank for no namespace.
  - Attribute namespace URI : Defines the URI associated with the namespace. Leave it blank for no namespace.
  - Default value : Defines the default text value of the node. This property allows defining a default value to use when no content is specified thanks to the Expression property of if this expression returns null .
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### jElement (`steps.ElementStep`)

- **Resume** : Defines an XML element based on a JavaScript expression. The jElement step adds an element node with text content to parent generated XML element in the sequence XML output. The XML element resulting from this step can be output in the response XML of the sequence if the Output property is set to true , or used as a source by any other following step. The element is named after the value of the Node name property, its value is set thanks to a JavaScript expression defined in Expression property. If the JavaScript expression is null, the XML element contains the value of the Default value property. Note: Child steps can be added under this step to create a data structure.
- **Parametres** :
  - Expression : Defines the expression evaluated to give the output text. This property is a JavaScript expression that is evaluated during the sequence execution and gives the text string to output in the generated element.
  - Node name : Defines the tag name of the generated XML element. This property can contain any name, no words are reserved, and must follow the rules on XML naming: - it can contain letters, numbers, and other characters, - it cannot start with a number, - it cannot contain spaces nor punctuation character.
  - Default value : Defines the default text value of the node. This property allows defining a default value to use when no content is specified thanks to the Expression property of if this expression returns null .
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

## Fichiers et systemes

### Copy file (`steps.CopyStep`)

- **Resume** : Copies a file or a directory to an another path. The Copy file step duplicates a file or a directory from a path to another keeping the same name. Note: Source parent folder and Destination folder cannot be the same.
- **Parametres** :
  - Destination : Defines the destination directory path. This property is a JavaScript expression that is evaluated during the sequence execution and gives the path of the destination folder, that must be an existing folder. Otherwise, the copy will not be possible. This path is either absolute or relative to Convertigo environment. Relative paths starting with: - ./ are relative to Convertigo workspace, - .// are relative to current project folder.
  - Overwrite : If a file or folder with the same name exists in Destination directory, this property defines whether to overwrite it. By default this property is set to false , so the file or folder will not be overwritten if already present in Destination directory.
  - Source : Defines the path of the file or directory to copy. This property is a JavaScript expression that is evaluated during the sequence execution and gives the path of the file or directory to copy. This path is either absolute or relative to Convertigo environment. Relative paths starting with: - ./ are relative to Convertigo workspace, - .// are relative to current project folder.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Create directory (`steps.CreateDirectoryStep`)

- **Resume** : Creates a new directory. The Create directory step creates a new directory on disk.
- **Parametres** :
  - Create non existent parent directories : Defines whether the non existent but necessary parent directories should be created or not. By default, this property is set to true : parents directories specified in path but not existing on disk are also created. If set to false , the directory will be created only if all parent directories are existing.
  - Destination : Defines the destination path. This property is a JavaScript expression that is evaluated during the sequence execution and gives the path of the destination folder. This path is either absolute or relative to Convertigo environment. Relative paths starting with: - ./ are relative to Convertigo workspace, - .// are relative to current project folder.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Delete file (`steps.DeleteStep`)

- **Resume** : Deletes a file or a directory. The Delete step removes a file or a directory.
- **Parametres** :
  - Source : Defines the path of the file or directory to delete. This property is a JavaScript expression that is evaluated during the sequence execution and gives the path of the file or directory to delete. This path is either absolute or relative to Convertigo environment. Relative paths starting with: - ./ are relative to Convertigo workspace, - .// are relative to current project folder.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Duplicate file (`steps.DuplicateStep`)

- **Resume** : Duplicates a file or a directory in the same path. The Duplicate file step duplicates a file or a directory in a given path updating its name.
- **Parametres** :
  - Name of the copy : Defines the name of the duplicated object (file or directory). Duplicating in the same parent folder, the copied file or directory name must be updated. This name must be different from original file or directory name.
  - Overwrite : If a file or folder with the same name as the Name of the copy property exists in current directory, this property defines whether to overwrite it. By default this property is set to false , so the previously existing file or folder will not be overwritten if already present in current directory.
  - Source : Defines the path of the file or directory to duplicate. This property is a JavaScript expression that is evaluated during the sequence execution and gives the path of the file or directory to duplicate. This path is either absolute or relative to Convertigo environment. Relative paths starting with: - ./ are relative to Convertigo workspace, - .// are relative to current project folder.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### List directory (`steps.ListDirStep`)

- **Resume** : Defines a step able to list the entries of a directory. A List directory step lists all the non hidden files of the first level contained in the directory specified by the Source directory property.
- **Parametres** :
  - Sort by : Defines the way to sort file entries. Directory files may be sorted by name (default), size or last modified time.
  - Source directory : Defines the source directory path. This property is a JavaScript expression that is evaluated during the sequence execution and gives the path of the directory which content has to be listed. This path is either absolute or relative to Convertigo environment. Relative paths starting with: - ./ are relative to Convertigo workspace, - .// are relative to current project folder.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Move file (`steps.MoveStep`)

- **Resume** : Moves a file or a directory to an another path. The Move file step copies a file or a directory from a path to another keeping the same name and removes the original one. Note: Source parent folder and Destination folder cannot be the same.
- **Parametres** :
  - Destination : Defines the destination directory path. This property is a JavaScript expression that is evaluated during the sequence execution and gives the path of the destination folder, that must be an existing folder. Otherwise, the copy will not be possible. This path is either absolute or relative to Convertigo environment. Relative paths starting with: - ./ are relative to Convertigo workspace, - .// are relative to current project folder.
  - Source : Defines the path of the file or directory to move. This property is a JavaScript expression that is evaluated during the sequence execution and gives the path of the file or directory to move. This path is either absolute or relative to Convertigo environment. Relative paths starting with: - ./ are relative to Convertigo workspace, - .// are relative to current project folder.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Read CSV (`steps.ReadCSVStep`)

- **Resume** : Reads a CSV file content and loads it into the step's XML. The Read CSV step reads any CSV file and loads its content as an XML. As a consequence, the content of the CSV file is available as a source for other following steps.
- **Parametres** :
  - Encoding : Defines the encoding used in the CSV file. Empty property value auto tries utf-8 and iso-8859-1 . Default value for encoding is utf-8 .
  - Separator : Defines the CSV default separator symbol. Any separator character can be configured using this property. Leave empty value to enable the separator auto detection. Default value is , .
  - Column tag : Defines the column tag name. Any tag name to use for columns in XML can be configured using this property. Default value is col .
  - Line tag : Defines the lines tag name. Any tag name to use for lines in XML can be configured using this property. Default value is line .
  - Title line : Defines whether the CSV file has a title line or not. If set to true , the first line of the CSV file is handled as a title line which means that each cell of the first line is used as tag name for the following lines, containing content. More precisely, for each cell of the first line, if the cell contains data, the tag associated with the corresponding column is named after this data. Otherwise or if the property is set to false , the tag is named after the Column tag property.
  - Vertical direction : Defines the array reading direction. If set to true , the reading direction is vertical. Otherwise, it is horizontal.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Read JSON (`steps.ReadJSONStep`)

- **Resume** : Reads a JSON file content and loads it into the step's XML. The Read JSON step reads any JSON file and loads its content. As a consequence, the content of the JSON file is available as a source for other following steps.
- **Parametres** :
  - Array children TagName : Defines TagName used to describe elements under a JSON array.
  - JSON Sample : Defines a sample of the expected JSON, used to extract the schema of the response.
  - Key : Defines the key name used for its Object parent owner. This property is a "smart type" property, that allows to specify the key. A "smart type" property can be of one of the following types: - a text : the value is therefore a hard-coded text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. Note: - If you use the source type for this property, the XPath application on target XML should give a text result. Otherwise, the first node's text content is taken.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Read XML (`steps.ReadXMLStep`)

- **Resume** : Reads an XML file content and loads it into the step's XML. The Read XML step reads any XML file and loads its content. As a consequence, the content of the XML file is available as a source for other following steps.
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Rename file (`steps.RenameStep`)

- **Resume** : Renames a file or a directory. The Rename step renames a file or a directory.
- **Parametres** :
  - New name : Defines the new name for file or directory.
  - Overwrite : Defines whether the destination file or directory should be overwritten if exists.
  - Source : Defines the path of the file or directory to rename. This property is a JavaScript expression that is evaluated during the sequence execution and gives the path of the file or directory to rename. This path is either absolute or relative to Convertigo environment. Relative paths starting with: - ./ are relative to Convertigo workspace, - .// are relative to current project folder.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Write CSV (`steps.WriteCSVStep`)

- **Resume** : Writes XML content in a CSV file. The Write CSV step allows outputting XML content in a CSV file on the disk. It can either create a new CSV file or update an existing CSV file.
- **Parametres** :
  - End Line type : Defines the line separator between rows. You can choose one of these values: - unix : n - windows : r n - dynamic : System.getProperty("line.separator").
  - Separator : Defines the CSV separator symbol to be used. By default, it uses the character ; as separator in the CSV file.
  - Title line : Defines whether data tags are named after the first line of data (titles). If set to true , the first line of the file is handled as a title line. For each XML tag providing data in this line, the tag content is added as title in the title line. If set to false , no title line is defined in the data nor in the file.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Write JSON (`steps.WriteJSONStep`)

- **Resume** : Writes XML content converted to JSON in a JSON file. The Write JSON step allows outputting XML content converted to JSON in a JSON file on disk. It can either create a new JSON file or update an existing JSON file as JSON array.
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Write XML (`steps.WriteXMLStep`)

- **Resume** : Writes XML content in an XML file. The Write XML step allows outputting XML content in an XML file on the disk. It can either create a new XML file or update an existing XML file.
- **Parametres** :
  - Default root tag name : Defines the root element tag name of the resulting XML to be written, if none is defined by the source. Setting this property allows adding a root element named after this property value in the XML file written.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Write binary from Base64 (`steps.WriteBase64Step`)

- **Resume** : Writes a binary file from a Base64 content. The Write binary from Base64 step allows writing a Base64 content from a response XML in a binary file on the disk. It can either create a new file or update an existing file, if a file of the same path and name already exists. The file extension has to be defined: it corresponds to the type of binary file to write. It can be set in the Output file property, at the end of the file path. A Base64 content must be used as input, defined by the Source property. Such input content could be picked in output XML of transactions, for example: - in an SQL transaction XML response: if the database contains a column with Base64 data, this content would be present in transaction output, - etc.
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

## Session et contexte

### Get authenticated user (`steps.GetAuthenticatedUserStep`)

- **Resume** : Gets the authenticated user ID from the context/session. The Get authenticated user step allows to retrieve in an XML Element the authenticated user ID from the context/session, if the context/session is authenticated. Otherwise, it returns an empty value. The element is named after the value of the Node name property.
- **Parametres** :
  - Node name : Defines the tag name of the generated XML element. This property can contain any name, no words are reserved, and must follow the rules on XML naming: - it can contain letters, numbers, and other characters, - it cannot start with a number, - it cannot contain spaces nor punctuation character.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Get from session (`steps.SessionGetStep`)

- **Resume** : Gets a stored variable/object from the session. The Get from session step allows to easily retrieve a value previously stored (thanks to the Set in session step for example) using its key. Note: The HTTP session is shared by all contexts that are executed for a same user's requests.
- **Parametres** :
  - Key : The key of the variable/object to retrieve, i.e. the stored variable name. The variable/object was stored in session using a key, also called name. This property allows to specify the name of the variable/object to retrieve.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Get object from session (`steps.SessionGetObjectStep`)

- **Resume** : Gets a stored variable/object from the session. The Get from session step allows to easily retrieve a value previously stored (thanks to the Set in session step for example) using its key. Note: The HTTP session is shared by all contexts that are executed for a same user's requests.
- **Parametres** :
  - Key : The key of the variable/object to retrieve, i.e. the stored variable name. The variable/object was stored in session using a key, also called name. This property allows to specify the name of the variable/object to retrieve.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### LDAP Authentication (`steps.LDAPAuthenticationStep`)

- **Resume** : Authenticates an user against an LDAP server. If the user is authenticated its ID is set in current context/session and thereby the current context/session is authenticated. The user ID is set using the Login property. and the LDAP password is set by the password property Note: Although its Output property is set to false by default, this step generates an LDAPAuthenticated XML Element in output, that should always contain a user attribute with the user ID value if the step succeeds. The generated XML element has a userDn XML Attribute which contain the distinguished name (dn) associated if one was found in the directory.
- **Parametres** :
  - LDAP admin login : Defines the login that has to be used for directory search. This property is a "smart type" property, that allows to define the user ID to set in authentication. A "smart type" property can be of one of the following types: - a text : the value is therefore a default text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. Note: If you use the source type for this property, the XPath application on target XML should give a text result. Otherwise, the first node's text content is taken. If addressing a Microsoft ActiveDirectory LDAP, Login may be in these 3 forms :  DOMAIN username - username@domain.xx - cn=username,cn=users,dc=domain,dc=xx.
  - LDAP admin password : Defines the password that has to be used for directory search. This property is a "smart type" property, that allows to define the user ID to set in authentication. A "smart type" property can be of one of the following types: - a text : the value is therefore a default text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution.
  - Search Attributes : Defines an optional list of attributes to search. Only works if LDAP binding policy is search and bind . "This property is a "smart type" property, that allows to define the user ID to set in authentication. A "smart type" property can be of one of the following types: - a text : the value is therefore a default text value, use as a list of one item, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, can be a single string value or a JS array of string values - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution.
  - LDAP base path : Defines the directory base path that has to be used for directory search. This property is a "smart type" property, that allows to define the user ID to set in authentication. A "smart type" property can be of one of the following types: - a text : the value is therefore a default text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution.
  - LDAP binding policy : Defines the policy to apply to bind to the server. This property specifies whether to search for the user before binding. It has the following options: - bind : try to bind the server using given user Login - search and bind : search if user exist in directory then bind using found distinguished name or given user Login.
  - LDAP user login : Defines the login that has to be used for directory bind and set as authenticated login. This property is a "smart type" property, that allows to define the user ID to set in authentication. A "smart type" property can be of one of the following types: - a text : the value is therefore a default text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. Note: If you use the source type for this property, the XPath application on target XML should give a text result. Otherwise, the first node's text content is taken. If addressing a Microsoft ActiveDirectory LDAP, Login may be in these 4 forms :  username - DOMAIN username - username@domain.xx - cn=username,cn=users,dc=domain,dc=xx.
  - LDAP user password : Defines the password that has to be used for directory bind and set as authenticated password. This property is a "smart type" property, that allows to define the user ID to set in authentication. A "smart type" property can be of one of the following types: - a text : the value is therefore a default text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. Note: If you use the source type for this property, the XPath application on target XML should give a text result. Otherwise, the first node's text content is taken.
  - LDAP servers : Defines the comma separated server URLs to use. This property is a "smart type" property, that allows to define the user ID to set in authentication. A "smart type" property can be of one of the following types: - a text : the value is therefore a default text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. LDAP server can be defined as a DNS name or IP address , default port is 389. Note: If you use the source type for this property, the XPath application on target XML should give a text result. Otherwise, the first node's text content is taken.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Remove authenticated user (`steps.RemoveAuthenticatedUserStep`)

- **Resume** : Removes the authenticated user ID from the context/session. The Remove authenticated user step allows to remove the authenticated user ID from the context/session. The context/session is not authenticated anymore. Note: Although its Output property is set to false by default, this step generates an authenticatedUserID XML Element in output, that should always be empty if the step succeeds.
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Remove from session (`steps.SessionRemoveStep`)

- **Resume** : Removes a variable/object from the session. The Remove from session step allows to easily remove a value stored in the session using its key. Note: The HTTP session is shared by all contexts that are executed for a same user's requests.
- **Parametres** :
  - Key : The key of the variable/object to remove from session, i.e. the variable name. This property allows to specify the name of the variable/object to remove from the session.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Set authenticated user (`steps.SetAuthenticatedUserStep`)

- **Resume** : Sets a user ID as the authenticated user ID of the current context/session. The Set authenticated user step allows to set a user ID as the authenticated user ID in the current context/session and thereby, sets the current context/session as authenticated. The user ID is set using the User ID property. Note: Although its Output property is set to false by default, this step generates an authenticatedUserID XML Element in output, that should always contain the user ID value if the step succeeds.
- **Parametres** :
  - User ID : Defines the user ID that has to be set as authenticated user. This property is a "smart type" property, that allows to define the user ID to set in authentication. A "smart type" property can be of one of the following types: - a text : the value is therefore a default text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. Note: If you use the source type for this property, the XPath application on target XML should give a text result. Otherwise, the first node's text content is taken.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Set in session (`steps.SessionSetStep`)

- **Resume** : Stores a variable/object in the session. The Set in session step allows to easily store a value that will be recoverable using its key. Note: The HTTP session is shared by all contexts that are executed for a same user's requests.
- **Parametres** :
  - Value : The variable/object to store in session, i.e. the value. This property is a "smart type" property, that allows to specify the variable/object to store in session. A "smart type" property can be of one of the following types: - a text : the value is therefore a default text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution.
  - Key : The key of the variable/object to store in session, i.e. the variable name. The variable/object to store in session is identified by a key, also called name. This property allows to specify the name of the variable/object to store (in order to be recoverable later using the same key, for example using the Get from session step).
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Set object in session (`steps.SessionSetObjectStep`)

- **Resume** : Stores a variable/object in the session. The Set in session step allows to easily store a value that will be recoverable using its key. Note: The HTTP session is shared by all contexts that are executed for a same user's requests.
- **Parametres** :
  - Key : The key of the variable/object to store in session, i.e. the variable name. The variable/object to store in session is identified by a key, also called name. This property allows to specify the name of the variable/object to store (in order to be recoverable later using the same key, for example using the Get from session step).
  - Value : The variable/object to store in session, i.e. the value. This property is a "smart type" property, that allows to specify the variable/object to store in session. A "smart type" property can be of one of the following types: - a text : the value is therefore a default text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

## Utilitaires

### Action (`steps.XMLActionStep`)

- **Resume** : Defines an action to be executed on a list of sources.
- **Parametres** :
  - Node name : Defines the tag name of the generated XML element. This property can contain any name, no words are reserved, and must follow the rules on XML naming: - it can contain letters, numbers, and other characters, - it cannot start with a number, - it cannot contain spaces nor punctuation character.
  - Sources : Defines the sources to which action applies.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Block (`steps.BlockStep`)

- **Resume** : Defines a group of steps.
- **Parametres** :
  - Condition : Defines the block condition expression. This property is a JavaScript expression that will be evaluated as condition ( true or false ) in order to decide whether to execute or not the child steps. JavaScript variables and code are supported in this property.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Branch (`steps.BranchStep`)

- **Resume** : Defines a step invoking others steps.
- **Parametres** :
  - Max. threads : Defines the maximum number of simultaneously processed threads. If this number is inferior to the number of child steps to be executed simultaneously, all child steps cannot start. In this case, Max. thread child steps start executing. The others wait for threads to be available.
  - Synchronous : Defines whether child steps should be invoked in a synchronous way.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Form PDF (`steps.PdfFormStep`)

- **Resume** : Generate a PDF with dynamic data in it. The PDF form step allows you to generate a PDF. You can use a tool such as PDFescape to make your PDF dynamic. You can use a complex containing elements to add dynamic values in your PDF. The elements names must be the name of your fields, then add its values. The template file path can be either relative or absolute :  ./ are relative to Convertigo workspace.  .// are relative to current project folder.  For absolute path you need to escape " ". Two actions are possible : fillForm and getFields . For the Fields property you can source your fields created with a complex type, or use a JSON Object type expression. If using a JSON Object type expression, this must be of the type : {key: value} where 'key' is your field name and 'value' its value. If you want to insert images in the PDF. You must create in the template for each image placeholder a "Submit" Button field with the size and position you would like the image to be inserted. The Form Fill Step will automatically scale the image to the Size of the button. The Image data can be in base64 format (Without the data:image/xxxx;base64, header) or can be a JPG or GIF file on disk. In this case just give the path to the image file. Action :  fillForm : Fill the form fields with values. You can use either complex type with elements or JSON Object type expression.  getFields : Collect all the fields of your PDF template. Return a XML schema.
- **Parametres** :
  - Action : Action you want to do. 'fillForm' intents to fill the fields. 'getFields' allows you to collect all the fields in a PDF.
  - Fields : The fields that will be contained in the form. To check checkboxes three values are possible : "On", "True", "Yes".
  - PDF template path : The PDF template path. ex : .//data/documents/template.pdf.
  - Target File Path : The target file path where the PDF file will be generated.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Generate (`steps.XMLGenerateStep`)

- **Resume** : Defines an action generating child steps based on input definitions.
- **Parametres** :
  - Node name : Defines the tag name of the generated XML element. This property can contain any name, no words are reserved, and must follow the rules on XML naming: - it can contain letters, numbers, and other characters, - it cannot start with a number, - it cannot contain spaces nor punctuation character.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Get request header (`steps.GetRequestHeaderStep`)

- **Resume** : Gets value of a request header for the current sequence. The Get request header step allows to retrieve a given HTTP header for the current sequence's request. The header name is set using the Header name property. Note: Although its Output property is set to false by default, this step generates an header XML Element in output, that contain the header name and value in child elements.
- **Parametres** :
  - Header name : Defines the header's name. This property is a "smart type" property, that allows to define the name of the header to retrieve from the request. A "smart type" property can be of one of the following types: - a text : the value is therefore a default text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Hash code (`steps.GenerateHashCodeStep`)

- **Resume** : Generates a hash code from a given file. The Hash code step generates a hash code from a given file using a predefined algorithm, that can be configured using the Hash algorithm property.
- **Parametres** :
  - Hash algorithm : Defines the algorithm to use for file hashing. This property can take one of the following values: - MD5 : uses MD5 algorithm to generate the hash from the file, - SHA-1 : uses SHA-1 algorithm to generate the hash from the file.
  - Node name : Defines the tag name of the generated XML element. This property can contain any name, no words are reserved, and must follow the rules on XML naming: - it can contain letters, numbers, and other characters, - it cannot start with a number, - it cannot contain spaces nor punctuation character.
  - Offset : Defines the offset in bytes from where the hash starts. This property allows you to hash just a part of your file. The offset must not be bigger than the file size.
  - Source : Defines the path of the file to hash. This property is a JavaScript expression that is evaluated during the sequence execution and gives the path of the file to hash. This path is either absolute or relative to Convertigo environment. Relative paths starting with: - ./ are relative to Convertigo workspace, - .// are relative to current project folder.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Input variables (`steps.InputVariablesStep`)

- **Resume** : Defines an XML element containing dynamically the input variables of parent Sequence . Placed at the beginning of a Sequence , this step allows steps ordered after to use the Sequence input variables as source.
- **Parametres** :
  - Node name : Defines the tag name of the generated XML element. This property can contain any name, no words are reserved, and must follow the rules on XML naming: - it can contain letters, numbers, and other characters, - it cannot start with a number, - it cannot contain spaces nor punctuation character.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Log (`steps.LogStep`)

- **Resume** : Produces output data in log file. This step outputs a message in the Convertigo logger defined in the Logger property, for the log level defined in the Level property. The message to output is generated from the JavaScript expression defined in Expression property.
- **Parametres** :
  - Expression : Defines the expression evaluated to give the text to output. This property is a JavaScript expression that is evaluated during the sequence execution and gives the text string to output in log file.
  - Level : Defines the log level on which the log applies. This property defines the minimum level of log for which the message has to be output. The message will be output for any log level superior or equals to this property value. Log levels possible values are the following, by ascending order: - ERROR , - WARN , - INFO , - DEBUG , - TRACE .
  - Logger : Defines the logger on which the log applies. This property defines Context logger as default logger. This value can be updated. Possible logger values are the following: - Engine : the message will be seen as output by the Convertigo Engine, - Context : the message will be seen as output by the running Context, - Context.User : the message will be seen as output in the running Context, defined by the User, - Context.Audit : the message will be seen as output in the running Context, in a separate Audit logger.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Loop (`steps.LoopStep`)

- **Resume** : Defines a loop of steps.
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Move file (`steps.MoveFileStep`)

- **Resume** : Moves a file to another folder.
- **Parametres** :
  - Input file : Defines the path of the file to move. The path is either absolute or relative to the project's directory.
  - Output file : Defines the target path. The path is either absolute or relative to the project's directory.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Process execute (`steps.ProcessExecStep`)

- **Resume** : Defines a step able to execute a process. A Process execute step executes the string command specified by the Command line property in a separate subprocess. The subprocess environment parameters and working directory may be defined through the Environment parameters and Execution directory properties. If left empty, they're inherited from the current process. Depending on the value of the Wait for end property, the step will wait or not until the subprocess has terminated. Note: Only real programs can be executed thanks to this step. In other words, you cannot execute commands interpreted by a shell (Windows DOS or Linux Bash for example).
- **Parametres** :
  - Encoding : Defines the encoding used for the process output. Default value is UTF-8 . If value is left empty, the default encoding of the Java virtual machine is used.
  - Command line : Defines the process command line. This property is a JavaScript expression that is evaluated at sequence execution. JavaScript variables and code are supported in this property. The syntax of this command line depends on the operating system where Convertigo is installed. If you want to execute some bash command use the ["bash", "-c", "my bash command"]. If you have a complex command to execute use the array syntax and separated each part of the command in a string array.
  - Environment parameters : Defines the process environment parameters. This property allows to define a list of environment parameters to define for the process execution. For each environment parameter, two columns have to be set: - Variable : defines the name of the parameter, - Value : defines the value of the parameter. Note: - A new environment parameter can be added to the list using the blue keyboard icon. The environment parameters defined in the list can be ordered using the arrow up and arrow down buttons, or deleted using the red cross icon. - If left empty, environment parameters are inherited from the current process, Convertigo.
  - Execution directory : Defines the process execution directory. If left empty, execution directory is inherited from the current process, Convertigo. For a project running in Convertigo Studio, the default directory is the installation directory (were is found the ConvertigoStudio.exe file). For a project running in Convertigo Server, the default directory is the application server root folder (tomcat folder for a standard Server installation on Windows).
  - Wait for end : Specifies whether the sequence should wait for the end of the process before continuing with next step. Default value is true , so the following step in the parent sequence is executed only after the process execution has returned.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Push Notifications (`steps.PushNotificationStep`)

- **Resume** : [Deprecated] Defines a step able to send notifications to mobile devices. The Push Notifications step is used to make the sequence send a notification to mobile devices using one of the standard APNS (Apple), or GCM (Android) channels. The list of devices to which send the notification is configured using the Device tokens property. The data to be sent in the notification is configured using the Notification data property. Other properties (which names start by APNS or Google) are those to use in order to configure the technical parameters of the push system. Note: For more information about using Push notifications in Convertigo, please refer to the article in our technical blog: http://www.convertigo.com/en/how-to/technical-blog/entry/using-convertigo-push-manager.html.
- **Parametres** :
  - Android push time to live : Defines the time to live (in seconds) of the push notification for Android devices. The Android push time to live property allows to define the time to live of the message sent for Android GCM. If the message is not delivered within this time, it will be discarded. This property is a JavaScript expression that is evaluated during the sequence execution and gives the time to live in seconds (it should be an integer value). Default value is 3600 seconds, i.e. one hour.
  - APNS notification type : Defines the type of push notification for Apple's APNS. This property allows to define which Apple's APNS push type is to be used. It can take one of the following values: - Message : sends messages, - Badge : notifies application's badge, - Sound : plays a sound. Default value is Message .
  - APNS certificate password : Defines the password of the Apple .p12 certificate file. This property is a JavaScript expression that is evaluated during the sequence execution and gives the valid password for the .p12 certificate file.
  - APNS client certificate : Defines an Apple .p12 certificate file to use for push on iOS devices. This property is a JavaScript expression that is evaluated during the sequence execution and gives the path of a .p12 certificate file. The .p12 file must be generated by Apple's Certificate portal (https://developer.apple.com/account/overview.action). This path is either absolute or relative to Convertigo environment. Relative paths starting with: - ./ are relative to Convertigo workspace, - .// are relative to current project folder. Note: Do not put the .p12 certificate in the DisplayObject folder of the current Convertigo project as it will be packaged within the mobile application during the build process. This would lead to a security breach.
  - Google API key : Defines the Google Cloud messaging API key to use for push on Android devices. This property is a JavaScript expression that is evaluated during the sequence execution and gives the Google Cloud messaging API key. This key can be obtained by following the Google Cloud Messaging documentation (http://developer.android.com/google/gcm/gs.html).
  - Notification title : Notification title.
  - Notification data : Defines the data to be sent in the notification. The Notification data property is of source type, defining a list of nodes from a previous step for current step to work on. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. If the XPath doesn't match or if the source is left blank, the step has no data to work on: notification is sent with no data. This content can be a text message, a number to be displayed on a badge, or the name of a sound to play, depending on the APNS notification type property value (only for iOS devices).
  - Device tokens : Defines the list of tokens identifying the mobile devices to notify. The Device tokens property is of source type, defining a list of nodes from a previous step for current step to work on. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. If the XPath doesn't match or if the source is left blank, the step has no data to work on: no device is selected, no notification is sent, and the parent sequence execution continues. Note: - The mobile device tokens must be known from the Convertigo Server so a list of tokens can be used in this property. Generally, the tokens are generated by the mobile device itself and are sent to Convertigo Server by executing a "storing" sequence. The "storing" sequence should store the tokens in a database (or else), so that they can be retrieved and used in this property. - The mobile device tokens are destination aware: an Android Google Cloud Messaging token will start by gcm: and Apple's APNS tokens will start by apns: . The tokens stored server-side already contain this piece of information.
  - APNS use production server : Defines the usage of the APNS production (true) or development (false) server. This property is a JavaScript expression that is evaluated during the sequence execution and should be a 'true' value for use the production APNS server, else use the development one.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Read file (`steps.ReadFileStep`)

- **Resume** : Loads a file content (to be read) into a step.
- **Parametres** :
  - Source : Defines the path of the file to read. This property is a JavaScript expression that is evaluated during the sequence execution and gives the path of the file to read. This path is either absolute or relative to Convertigo environment. Relative paths starting with: - ./ are relative to Convertigo workspace, - .// are relative to current project folder.
  - Replace 'step' element : Defines if the root 'step' element should be replaced by its content. If 'true', the current Step will append the content of the file to the current Sequence, if 'false' the content is added to a 'step' element appended to the current Sequence.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Remove context (`steps.RemoveContextStep`)

- **Resume** : Defines a step which removes a named Convertigo context. The Remove context step removes a Convertigo context that was created by: - a previous Call Transaction or Call Sequence step for which a specific context name was defined, - an __context parameter sent to Convertigo while previously calling a transaction/sequence. The name of the context to remove is specified through the Context name property. Note: The creation or the destruction of a named context is effective in server mode only.
- **Parametres** :
  - Context name : Defines the name of the context to remove. This property is a JavaScript expression that is evaluated at sequence execution. The computed context name is appended to the current session JSessionID to define the context ID that is removed.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Remove session (`steps.RemoveSessionStep`)

- **Resume** : Defines a step which request the current http session termination. The Remove session step requests the removing of the current HTTP session and all its contexts. No other steps can executed after this one. Note: The creation or the destruction of a http is effective in server mode only.
- **Parametres** : Aucun parametre specifique expose au studio.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### SMTP send (`steps.SmtpStep`)

- **Resume** : Defines a step able to send emails through an SMTP server. The SMTP send step is used to make the sequence send an email to designated email addresses through an SMTP server. This is useful for monitoring a sequence progress or completion. When executed, an SMTP send step tries to send an email using a specified set of parameters. If ever the specified SMTP server does not support relaying or anonymous sending, the SMTP send step supports authentication.
- **Parametres** :
  - Attachments : Defines a list of file attachments to send with the email. This property is an array of files to send as email attachments. Each email attachment is a pair of values: - Filepath : the path of the local file to send, including its original name, defined as a JavaScript expression that is evaluated during the sequence execution, - Filename : the name of the file as attached in the email, defined as a JavaScript expression that is evaluated during the sequence execution. The filepaths are either absolute or relative to Convertigo environment. Relative paths starting with:  ./ are relative to Convertigo workspace, - .// are relative to current project folder. Note: A new attachment can be added to the list using the blue keyboard icon. The attachments defined in the list can be ordered using the arrow up and arrow down buttons, or deleted using the red cross icon.
  - Content-type : Defines the content-type of the email content. This property is a JavaScript expression that is evaluated during the sequence execution and allows to override the default content-type. If this property is left empty, the default content-type is: - text/plain; charset=UTF-8 in standard text email, - text/html; charset=UTF-8 in HTML content email, i.e. if an XSL file is defined in the XSL file property.
  - Delivery receipt : Defines whether a delivery receipt should be return. This kind of receipt is sent as soon as the server receives the email. Be aware that a lot of mail servers like gmail are discarding this requests.
  - Read receipt : Defines whether a read receipt should be return. This kind of receipt is sent as soon as the recipient opens the email. Be aware that a lot of mail servers like gmail are discarding this requests.
  - Authentication type : Defines the SMTP authentication type. You can choose the authentication used by the SMTP send step amongst the following types: - None : no authentication, this value is set by default, - Basic : basic authentication, - STARTTLS : authentication using STARTTLS, - SSL/TLS : authentication using SSL/TLS. All authentication types use the username and password set in the SMTP user and SMTP password properties.
  - SMTP password : Defines the SMTP server authentication user password. Used alongside SMTP user to authenticate on the SMTP server. To prevent authentication, leave both SMTP user and SMTP password properties empty. Convertigo then establishes anonymous connection on the SMTP server.
  - SMTP port : Defines the listening port of the SMTP server. Default is 25 for non-auth servers, it can be 587 or 465 for TLS/SSL or STARTTLS servers.
  - Recipients email addresses : Defines recipient email addresses. This property is a JavaScript expression that is evaluated during the sequence execution and gives the list of recipient email addresses. This property contains a list of email addresses, separated by semi-colons or commas. The syntax to use is of the following form: : , where can be To, Cc or Bcc . For example, To:myself@mydomain.com . Note: If not specified, the first address is always considered the main recipient ( To ), following addresses are considered secondary recipients ( Cc ).
  - Sender email address : Defines the email address of the sender. This property is a JavaScript expression that is evaluated during the sequence execution and contains an email address, but can also accept a value of this form Convertigo to add the name of the email address owner. It is useful if you want the receiver(s) to be able to answer the received email. This property is used depending on the SMTP server, it can be: - informative and have no consequence in the email sending, - automatically replaced by the SMTP server by the real email address matching the authentication, - used by the SMTP server to send the email, - etc. Consult your SMTP server documentation for more information about the FROM email field.
  - SMTP server : Defines the name or IP address of the SMTP server. This server must be able to deliver emails to the domains used in recipients addresses. In some cases, you may have to use authentication.
  - Subject : Defines the email subject. This property is a JavaScript expression that is evaluated during the sequence execution and gives the email subject. Note: It is recommended to not leave it empty.
  - SMTP user : Defines the SMTP server authentication username. If this parameter is used, the step tries to authenticate on the SMTP server using it along with SMTP password .
  - Source : Defines the source to build email body. This property allows defining a list of nodes from a previous step used to build the email body content. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. The resulting nodes are written in the email body content depending on the nodes types: - Attribute/Text node/Comment/CDATA section : the node text content is directly copied to the email body content, - Element : the element's DOM is pretty printed in the email body content with nice indentation to easily read the XML, - Other : the node's DOM is pretty printed in the email body content. If the XPath doesn't match or if the source is left blank, the XML output document of the sequence (i.e., sequence resulting XML) is used as source. In this case, the step behavior can be seen as a sequence output dump.
  - SSL protocols : Defines the SSL protocols to use (default: TLSv1.2). Specifies the SSL protocols that will be enabled for SSL connections. The property value is a whitespace separated list of tokens acceptable to the javax.net.ssl.SSLSocket.setEnabledProtocols method (default: TLSv1.2).
  - XSL file : Defines the XSL file path to apply on the XML content to send an HTML email content. This property is a JavaScript expression that is evaluated during the sequence execution and gives the path and name of the XSL file to use to transform the XML data in HTML content. This has as result to send an HTML content email instead of an XML/text email. This path is either absolute or relative to Convertigo environment. Relative paths starting with: - ./ are relative to Convertigo workspace, - .// are relative to current project folder. If the path is empty, not XSL transformation is applied and the mail content is a plain XML/text.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Set response header (`steps.SetResponseHeaderStep`)

- **Resume** : Sets a response header for the current sequence. The Set response header step allows to add or set an HTTP header on the sequence's response. The header name and value are set using the Header name and the Header value properties. Note: Although its Output property is set to false by default, this step generates an header XML Element in output, that contain the header name and value in child elements.
- **Parametres** :
  - Header name : Defines the header's name. This property is a "smart type" property, that allows to define the name of the header to set on the response. A "smart type" property can be of one of the following types: - a text : the value is therefore a default text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. property.headerValue.display_name=Header value.
  - headerValue : Defines the header's value. This property is a "smart type" property, that allows to define the value of the header to set on the response. A "smart type" property can be of one of the following types: - a text : the value is therefore a default text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Set response status (`steps.SetResponseStatusStep`)

- **Resume** : Sets a response status for the current sequence. The Set response status step allows set an HTTP status on the sequence's response. The status code and message are set using the Status code and the Status text properties. Note: Although its Output property is set to false by default, this step generates an status XML Element in output, that contain the status code and text in child elements.
- **Parametres** :
  - Status code : Defines the code value associated with the status. This property is a "smart type" property, that allows to define the HTTP status code to set on the response. A "smart type" property can be of one of the following types: - a text : the value is therefore a default text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution.
  - Status text : Defines the text message associated with the status. This property is a "smart type" property, that allows to define the HTTP status message to set on the response. A "smart type" property can be of one of the following types: - a text : the value is therefore a default text value, - a JavaScript expression : the value is therefore a JavaScript expression that is evaluated at sequence execution, - a source : the value is a source and can be picked using the source picker. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Sleep (`steps.SleepStep`)

- **Resume** : Defines a Sleep step.
- **Parametres** :
  - Delay : Defines the sleep duration (in milliseconds).
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Test (`steps.TestStep`)

- **Resume** : Defines a step looking for matches on source.
- **Parametres** :
  - Source : Defines the source to work on. This property allows defining a list of nodes from a previous step on which current step performs tests. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. If the XPath doesn't match or if the source is left blank, the step has no data to work on: the test fails.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.

### Write File (`steps.WriteFileStep`)

- **Resume** : Writes XML content in a file.
- **Parametres** :
  - Append Result : Defines whether the XML must be appended at the end of the file. If set to true , and if the file exists, the step appends the XML at the end of the file. If set to false , it overrides the current file content.
  - Append timestamp : Defines whether the file name should be created with a timestamp. If set to true , the date is concatenated to the file name in yyyymmddHHmmssSSS format.
  - Output file : Defines the output file path including the file name. This property is a JavaScript expression that is evaluated during the sequence execution and gives the path and name of the file to write. This path is either absolute or relative to Convertigo environment. Relative paths starting with: - ./ are relative to Convertigo workspace, - .// are relative to current project folder.
  - Encoding : Defines the encoding used in output file. Default used encoding is ISO-8859-1 .
  - Source : Defines the source data to write. This property allows defining a list of nodes from a previous step used as data root to be written in the file. A source is defined as a reference on a step previously existing in the parent sequence, associated with an XPath applied on the step's result DOM. At runtime, the XPath is applied on the step's current execution result XML and extracts a list of XML nodes resulting from this execution. If the XPath doesn't match or if the source is left blank, the XML output document of the sequence (i.e., sequence resulting XML) is used as source. In this case, the step behavior can be seen as a sequence output dump. If REST or SOAP interfaces are used to call parent sequence, the XML output document is normally returned to the sequence caller.
  - Write Output False : Defines if the XML should contains Output False elements. If set to true (default), all XML generated from the source is written to the file else only Step flagged as Output True will be.
- **Sortie / Effets** : Se reporter au resume et aux parametres pour comprendre les donnees produites ou les effets de bord.
