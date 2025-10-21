# Descriptions des steps Convertigo

Ce document regroupe les libelles et resumes issus des fichiers .properties des steps.

Pour les parametres detailles et les effets, voir `sequence-step-details.md`.

| Cle YAML | Nom palette | Description extraite |
| --- | --- | --- |
| `steps.AttributeStep` | jAttribute | Creates an XML attribute node based on a JavaScript expression. |
| `steps.BlockStep` | Block | Defines a group of steps. |
| `steps.BranchStep` | Branch | Defines a step invoking others steps. |
| `steps.BreakStep` | jBreak | Defines a BREAK step. |
| `steps.CopyStep` | Copy file | Copies a file or a directory to an another path. |
| `steps.CreateDirectoryStep` | Create directory | Creates a new directory. |
| `steps.DeleteStep` | Delete file | Deletes a file or a directory. |
| `steps.DoWhileStep` | jDoWhile | Defines a DO...WHILE loop step based on a JavaScript condition. |
| `steps.DuplicateStep` | Duplicate file | Duplicates a file or a directory in the same path. |
| `steps.ElementStep` | jElement | Defines an XML element based on a JavaScript expression. |
| `steps.ElseStep` | jElse | Defines an Else step. |
| `steps.ExceptionStep` | jException | Raises a Convertigo Engine exception. |
| `steps.FunctionStep` | jFunction | Defines a FUNCTION step. |
| `steps.GenerateHashCodeStep` | Hash code | Generates a hash code from a given file. |
| `steps.GetAuthenticatedUserStep` | Get authenticated user | Gets the authenticated user ID from the context/session. |
| `steps.GetRequestHeaderStep` | Get request header | Gets value of a request header for the current sequence. |
| `steps.IfExistStep` | IfExist | Defines an IF conditional step looking for node(s) on a source. |
| `steps.IfExistThenElseStep` | IfExistThenElse | Defines an IF...THEN...ELSE... conditional step looking for node(s) on a source. |
| `steps.IfFileExistStep` | IfFileExists | Defines an IF conditional step looking for the existence of a file or a directory. |
| `steps.IfFileExistThenElseStep` | IfFileExistsThenElse | Defines an IF...THEN...ELSE... conditional step looking for the existence of a file or a directory. |
| `steps.IfStep` | jIf | Defines an IF conditional step based on a JavaScript condition. |
| `steps.IfThenElseStep` | jIfThenElse | Defines an IF...THEN...ELSE... conditional step based on a JavaScript condition. |
| `steps.InputVariablesStep` | Input variables | Defines an XML element containing dynamically the input variables of parent Sequence. |
| `steps.IsInStep` | IfIsIn | Defines an IF conditional step looking for matches on a source. |
| `steps.IsInThenElseStep` | IfIsInThenElse | Defines an IF...THEN...ELSE... conditional step looking for matches on a source. |
| `steps.IteratorStep` | Iterator | Defines a loop step iterating on XML nodes result from a source. |
| `steps.JsonArrayStep` | Array | Creates an XML element ready to output a JSON Array. |
| `steps.JsonFieldStep` | Field | Creates a JSON base type. |
| `steps.JsonObjectStep` | Object | Creates an JSON Object. |
| `steps.JsonSourceStep` | JsonSource | Defines a step extracting a JSON typed XML structure from a source into a variable in Javascript scope. |
| `steps.JsonToXmlStep` | JSON to XML | Creates an XML attribute node based on a JavaScript expression. |
| `steps.LDAPAuthenticationStep` | LDAP Authentication | Authenticates an user against an LDAP server. |
| `steps.ListDirStep` | List directory | Defines a step able to list the entries of a directory. |
| `steps.LogStep` | Log | Produces output data in log file. |
| `steps.LoopStep` | Loop | Defines a loop of steps. |
| `steps.MoveFileStep` | Move file | Moves a file to another folder. |
| `steps.MoveStep` | Move file | Moves a file or a directory to an another path. |
| `steps.ParallelStep` | Parallel | Defines a step executing child steps in parallel. |
| `steps.PdfFormStep` | Form PDF | Generate a PDF with dynamic data in it. |
| `steps.ProcessExecStep` | Process execute | Defines a step able to execute a process. |
| `steps.PushNotificationStep` | Push Notifications | [Deprecated] Defines a step able to send notifications to mobile devices. |
| `steps.ReadCSVStep` | Read CSV | Reads a CSV file content and loads it into the step's XML. |
| `steps.ReadFileStep` | Read file | Loads a file content (to be read) into a step. |
| `steps.ReadJSONStep` | Read JSON | Reads a JSON file content and loads it into the step's XML. |
| `steps.ReadXMLStep` | Read XML | Reads an XML file content and loads it into the step's XML. |
| `steps.RemoveAuthenticatedUserStep` | Remove authenticated user | Removes the authenticated user ID from the context/session. |
| `steps.RemoveContextStep` | Remove context | Defines a step which removes a named Convertigo context. |
| `steps.RemoveSessionStep` | Remove session | Defines a step which request the current http session termination. |
| `steps.RenameStep` | Rename file | Renames a file or a directory. |
| `steps.ReturnStep` | Return | Defines a RETURN step. |
| `steps.SequenceStep` | Call Sequence | Defines a step invoking a sequence. |
| `steps.SerialStep` | Serial | Defines a step executing child steps in series. |
| `steps.SessionGetObjectStep` | Get object from session | Gets a stored variable/object from the session. |
| `steps.SessionGetStep` | Get from session | Gets a stored variable/object from the session. |
| `steps.SessionRemoveStep` | Remove from session | Removes a variable/object from the session. |
| `steps.SessionSetObjectStep` | Set object in session | Stores a variable/object in the session. |
| `steps.SessionSetStep` | Set in session | Stores a variable/object in the session. |
| `steps.SetAuthenticatedUserStep` | Set authenticated user | Sets a user ID as the authenticated user ID of the current context/session. |
| `steps.SetResponseHeaderStep` | Set response header | Sets a response header for the current sequence. |
| `steps.SetResponseStatusStep` | Set response status | Sets a response status for the current sequence. |
| `steps.SimpleIteratorStep` | jIterator | Defines a loop step iterating on list items result from a JavaScript expression. |
| `steps.SimpleSourceStep` | jSimpleSource | Defines a step extracting a string from a source into a variable in Javascript scope. |
| `steps.SimpleStep` | Sequence JS | Defines a scripting step. |
| `steps.SleepStep` | Sleep | Defines a Sleep step. |
| `steps.SmtpStep` | SMTP send | Defines a step able to send emails through an SMTP server. |
| `steps.SourceStep` | jSource | Defines a step extracting a list of nodes from a source into a variable in JavaScript scope. |
| `steps.TestStep` | Test | Defines a step looking for matches on source. |
| `steps.ThenStep` | jThen | Defines a Then step. |
| `steps.TransactionStep` | Call Transaction | Defines a step invoking a transaction. |
| `steps.WhileStep` | jWhile | Defines a WHILE loop step based on a JavaScript condition. |
| `steps.WriteBase64Step` | Write binary from Base64 | Writes a binary file from a Base64 content. |
| `steps.WriteCSVStep` | Write CSV | Writes XML content in a CSV file. |
| `steps.WriteFileStep` | Write File | Writes XML content in a file. |
| `steps.WriteJSONStep` | Write JSON | Writes XML content converted to JSON in a JSON file. |
| `steps.WriteXMLStep` | Write XML | Writes XML content in an XML file. |
| `steps.XMLActionStep` | Action | Defines an action to be executed on a list of sources. |
| `steps.XMLAttributeStep` | Attribute | Creates an XML attribute node. |
| `steps.XMLComplexStep` | Complex | Defines an empty XML element (with no text content). |
| `steps.XMLConcatStep` | Concat | Concatenates defined sources. |
| `steps.XMLCopyStep` | Copy | Imports a copy of XML elements sourced from a previous step. |
| `steps.XMLCountStep` | Count | Defines an XML element containing the number of nodes found. |
| `steps.XMLDateTimeStep` | Date/Time | Creates a datetime XML element from defined source(s). |
| `steps.XMLElementStep` | Element | Creates an XML element with a text content. |
| `steps.XMLErrorStep` | Error structure | Creates an XML structure describing an applicative error. |
| `steps.XMLGenerateDatesStep` | Generate dates | Creates a list of XML elements containing dates based on input definitions. |
| `steps.XMLGenerateStep` | Generate | Defines an action generating child steps based on input definitions. |
| `steps.XMLSortStep` | Sort | Sorts XML nodes from a source using a sort key defined by an XPath. |
| `steps.XMLSplitStep` | Split | Splits sourced text into XML elements. |
| `steps.XMLTransformStep` | Transform | Replaces regular expressions found in a source with other expressions. |
