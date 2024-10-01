import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
/*=c8o_ModuleTsImports*/
/*=c8o_CompImport*/

@NgModule({
  declarations: [/*Begin_c8o_NgDeclarations*/
	/*=c8o_CompName*/
  /*End_c8o_NgDeclarations*/],
  imports: [/*Begin_c8o_NgModules*/
  	CommonModule,
	FormsModule,
	ReactiveFormsModule,
	IonicModule,
	TranslateModule.forChild(),
  /*End_c8o_NgModules*/],
  exports: [RouterModule,/*=c8o_ModuleNgExports*//*=c8o_CompName*/],
  providers: [/*Begin_c8o_NgProviders*/
  /*End_c8o_NgProviders*/],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class /*=c8o_CompModuleName*/ {}