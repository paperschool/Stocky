
# Stocky

This library was designed to interact with the REST API of the EPOSNOW Developer Endpoint. The front end is comprised of a dynamically generated set of gui elements that allow the user to interact with each endpoint of the API.

Its main purpose is to provide an alternative method to add bulk products to the epos system as the existing one does not consider the difficulties associated with running a clothing / shoe shop.

- - -

### Table Component

The Table elements are used for easy interaction with each categoerial endpoint such as colours, styles etc. The table elements are completely dynamic, fully interactive allowing for editing of fields and deletion of the record entirely. The plus button creates a new row and the save buttons are used apply all changes to the database.

### Custom Sub components

The table component makes use of various sub components such as buttons, boolean switches, text inputs and drop down variants.

### Web Workers

All major components register their own web worker which is responsible for performing concurrent ajax requests to the rest api. The system keeps track of redundent transactions, for example if a new row is made and then deleted before saving, this row is ignored in the final push, along with many other optimisations.

The webworkers are also responsible for major endpoints, for example any interaction to the colour table is done through its registered webworker. This way any changes from one component are reflected in any other component using the colour table for consistency.

### Product Matrix Editor

The Second page of the GUI takes all details added in the previous page and allows the user to build a cartesian product of all the sub elements of a product such as its colours, size range and style.

The various components in this form utilise custom widgets such as a single selection drop down, a multi selection drop down and a product size range enumerator.

When all the details have been added to the page, the add bitton will create an array of these products based on the variant details entered producing a large bulk entry into the epos end point saving time and effort.

### Libraries & Trello

 - Bootstrap v4.0.0-alpha.6 - (https://getbootstrap.com)
 - Tether Notifications - (http://tether.io/)

 - Trello - (https://trello.com/b/2zER6YS9/stocky-library)
