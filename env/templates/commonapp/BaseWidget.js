define(["dojo/_base/declare",
        "dojo/_base/lang",
        "module",
        "dojo/i18n!./nls/CommonText",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin"],function(declare,lang,module,nls,_WidgetBase,_TemplatedMixin,_WidgetsInTemplateMixin){
	
	var MODULE = module.id;
	return declare([_WidgetBase,_TemplatedMixin,_WidgetsInTemplateMixin],{
		/**
		 * @memberOf BaseWidget
		 */
		
		nls : nls,
		
		constructor : function(args){
			
		},
		
		postCreate : function(){
			var F = MODULE + ":postCreate:";
			console.debug(F,"Created widget");
		}
	});
});