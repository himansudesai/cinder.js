## Cinder.js
Cinder.js is an Ember based ease-of-use wrapper around the popular jQuery UI library. It demonstrates the ability to easily integrate other libraries with Ember with bi-directional data propagation.

Widgets can be programmatically controlled by manipulating the data model.

In many instances, client code will not need to react to events directly. Data will automatically be updated when relevant events occur (e.g. slider stops sliding or the date picker dialog closes). If app specific subclasses of Cinder Views are used, and have event handlers defined, they will get called after the data is updated.

### Supported Widgets
As of May 6 2012, the following widgets can be used through Cinder
- Slider
- Date Picker
- Accordion
- Tabs
- Progress Bar

Not all events are supported (passed by Cinder to client code) - this will follow shortly.

Support for other Widgets and Interactions is coming...