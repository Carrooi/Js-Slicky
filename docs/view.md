# View

`View` represents scope used by [directive](./directives.md) for one DOM 
element. DOM element can have only one `View`, but `View` can have many 
directives. It also contains all other bindings, attached properties and 
`Watcher` for change detection.

All [directives](./directives.md) are forked from first main 
[directive](./directives.md) given to your main [component](./components.md).
