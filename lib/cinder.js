Cinder = {};


Cinder.uiEvent = function(eventType, event, jqUI, htmlElement) {
  var emberView = null;
  var id = ($(htmlElement)).attr("id");

  if (id !== null) {
    var emberView = Ember.View.views[id];
    if (emberView !== null) {
      if(emberView[eventType]) {
        emberView[eventType](event, jqUI);
      }
    }
  }
  return emberView;
}


Cinder.BaseComponent = Ember.Mixin.create({
  addObserver: function(observer, callback, key, observed) {
    observed.addObserver(key, callback);
  },
  willDestroyElement: function() {
    if (this.observed != null) {
      console.log('removing ' + this.observer + ' as an observer of ' + this.observed + ' for key ' + this.key);
      this.observed.removeObserver(this.key, this.observer);
    }
  }
});


// Slider - Component.  Automatic 2-way binding if valueObject is provided
// Supports events: start
//                  stop
//                  change
//                  slide
// Supported options: step
//                    min
//                    max
//                    orientation
//                    animate
//                    disabled
Cinder.JquiSliderComponent = Ember.Component.extend(Cinder.BaseComponent, {
  classNames: ['slider'],
  sliderStop: function(event, slider) {
    this.get('slider').set('value', slider.value);
    this.sendAction('stop');
  },
  didInsertElement: function() {
    var self = this;
    var slider = (self.$()).slider({
      orientation: self.get('orientation'),
      step: self.get('step'),
      min: self.get('min'),
      max: self.get('max'),
      animate: self.get('animate'),
      disabled: self.get('disabled'),
      stop: self.sliderStop.bind(self),
      change: function() { self.sendAction('change') },
      slide: function() { self.sendAction('slide') },
      start: function() { self.sendAction('start') }
    });
    if (self.get('slider')) {
      var sliderModel = self.get('slider');
      slider.slider({value: sliderModel.get('value')});
      var observingFn = function(observed) {
        slider.slider("option", "value", sliderModel.get('value'));
      };
      self.addObserver(self, observingFn, 'value', self.get('slider'));
    }
  }
});


// Date Picker - Component
Cinder.JquiDatepickerComponent = Ember.Component.extend(Cinder.BaseComponent, {
  datePickerClose: function(x, y) {
    this.get('date').set('value', x);
  },
  didInsertElement: function() {
    var self = this;
    var date_picker = (self.$()).find("input").datepicker({
      changeYear: function() { self.sendAction('changeYear') },
      changeMonth: function() { self.sendAction('changeMonth') },
      onClose: self.datePickerClose.bind(self),
    });

    if (self.get('date')) {
      var on = self.get('date');
      (self.$()).find("input").val(self.get('date').get('value'));
      var observingFn = function() {
        (self.$()).find("input").val(self.get('date').get('value'));
      };
      self.addObserver(self, observingFn, 'value', self.get('date'));
    }
  }
});


// Progress Bar - Component
// Supports events: complete
//                  change
// Supported options: ---
Cinder.JquiProgressbarComponent = Ember.Component.extend(Cinder.BaseComponent, {
  didInsertElement: function() {
    var self = this;
    var progress_bar = (self.$()).progressbar({
      complete: function() { self.sendAction('complete'); },
      change: function() { self.sendAction('change'); },
    });
    if (this.get('progressbar')) {
      progress_bar.progressbar({value: this.get('progressbar').get('value')})
      var observingFn = function(observed) {
        progress_bar.progressbar('value', self.get('progressbar').get('value'));
      };
      self.addObserver(self, observingFn, 'value', self.get('progressbar'));
    }
  }
});


// Tabs - Component
// Supports events: select
// Supported options: collapsible
Cinder.JquiTabsComponent = Ember.Component.extend(Cinder.BaseComponent, {
  tabSelect: function(event, tabs) {
    this.get('curTab').set('value', tabs.newTab.index());
  },
  numTabs: 0,
  didInsertElement: function() {
    var rand = Math.floor(Math.random()*500000);
    var self = this;
    if (self.get('tabs')) {
      self.numTabs = self.get('tabs').content.length;
      var tabs_str = '<ul>';
      for (var i = 0; i < self.numTabs; i++) {
        tabs_str += '<li><a href=\"#tabs-' + rand + '-' + i + '\">' + self.get('tabs').content[i][0] + '</a></li>';
      }
      tabs_str += '</ul>';

      for (var i = 0; i < self.numTabs; i++) {
        tabs_str += '<div id=\"tabs-' + rand + '-' + i + '\">' + self.get('tabs').content[i][1] + '</div>';
      }
      (self.$()).append(tabs_str);
      self.get('tabs').addObserver('content', function() {
        ((self.$()).find('>div')).each(function(index) {
          $(this).html(self.get('tabs').content[index][1]);
        });
        ((self.$()).find('ul li a')).each(function(index) {
          $(this).text(self.get('tabs').content[index][0]);
        });
      });
      self.get('curTab').addObserver('value', function() {
        (self.$()).tabs("option", "active", self.get('curTab').get('value'));
      });
      (self.$()).tabs({
        activate: self.tabSelect.bind(self),
        collapsible: self.collapsible
      });
     (self.$()).tabs("option", "active", self.get('curTab').get('value'));
    }
  }
});


// Accordion- Component
// Supports events: start
//                  stop
//                  change
//                  slide
// Supported options: autoHeight
//                    collapsible
//                    active
//                    animated
//                    autoHeight
//                    disabled
//                    fillSpace
//                    navigation
//                    event
Cinder.JquiAccordionComponent = Ember.Component.extend(Cinder.BaseComponent, {
  didInsertElement: function() {
    var self = this;
    self.contentSize = 0;
    if (self.get('accordion')) {
      self.contentSize = self.get('accordion').content.length;
      var hdr = (self.header ? self.header : 'h6');
      var accordion_str = '';
      for (var i = 0; i < self.get('accordion').content.length; i++) {
        accordion_str += '<' + hdr + '><a href=\"#\" class=\"cinder-accordian\">' + self.get('accordion').content[i][0] + '</a></' + hdr + '>' +
        '<div>' + self.get('accordion').content[i][1] + '</div>'
      }
      ((self.$())).append(accordion_str);

      var observingFn = function() {
        (self.$()).find("input").val(self.get('accordion').get('value'));
      };

      var observingFn = function() {
        ((self.$()).find('>div')).each(function(index) {
          $(this).html(self.get('accordion').content[index][1]);
        });
        ((self.$()).find('h2 a')).each(function(index) {
          $(this).text(self.get('accordion').content[index][0]);
        });
      };
      self.addObserver(self, observingFn, 'content', self.get('accordion'));
    }
    console.log('animated = ' + self.get('animated'));
    console.log('autoheight = ' + self.get('autoHeight'));
    console.log('collapsible = ' + self.get('collapsible'));
    console.log('active = ' + self.get('active'));
    (self.$()).accordion({
      autoHeight: self.get('autoHeight'),
      collapsible: self.get('collapsible'),
      active: self.get('active'),
      animated: self.get('animated'),
      autoHeight: self.get('autoHeight'),
      clearStyle: self.get('clearStyle'),
      fillSpace: self.get('fillSpace'),
      navigation: self.get('navigation'),
      event: self.get('event'),
      disabled: self.get('disabled')
    });
    if (self.onChange) {
      ((self.$())).bind("accordionchange", self.onChange);
    }
  }
});


// Sortable - Component
Cinder.JquiSortableComponent = Ember.Component.extend(Cinder.BaseComponent, {
  originalContent: [],
  previousList: [],
  tagName: 'ul',
  sortableUpdate: function(event, sortable) {
    var emberComponent = this;
    var draggedItem = event.srcElement;
    if (draggedItem == undefined) {
      var ulElement = event.target;
      var liElements = $(ulElement).find('li');
      var newList = [];
      liElements.each(function(index, ele) {
        newList.push(ele.innerHTML);
      });
      var changeRangeMin;
      var changeRangeMax;
      for (var i=0; i<emberComponent.previousList.length; i++) {
        if (emberComponent.previousList[i] != newList[i]) {
          if (changeRangeMin == undefined) {
            changeRangeMin = i;
          } else {
            changeRangeMax = i;
          }
        }
      }
      if ( (changeRangeMin != undefined) && (changeRangeMax != undefined) ) {
        if (emberComponent.previousList[changeRangeMin] == newList[changeRangeMax]) {
          changeIndex = changeRangeMin;
          draggedItem = emberComponent.previousList[changeRangeMin];
        } else if (emberComponent.previousList[changeRangeMax] == newList[changeRangeMin]) {
          changeIndex = changeRangeMax;
          draggedItem = emberComponent.previousList[changeRangeMax];
        }
      }
      emberComponent.set('previousList', newList);
    } else {
      draggedItem = draggedItem.innerHTML;
    }

    var newContent = [];
    var list = event.target;
    if (list) {
      var done = false;
      var curItem = list.firstChild;
      while (done == false) {
        if (curItem) {
          newContent.push(curItem.innerHTML);
          if (curItem.nextSibling) {
            curItem = curItem.nextSibling;
          } else {
            done = true;
          }
        } else {
          done = true;
        }
      }
      emberComponent.get('dragInfo').set('item', draggedItem);
      emberComponent.get('dragInfo').set('oldIndex', emberComponent.originalContent.indexOf(draggedItem));
      emberComponent.get('dragInfo').set('newIndex', newContent.indexOf(draggedItem));
      emberComponent.get('sortables').set('content', newContent);
    }
  },
  buildList: function(self) {
    if (self.get('sortables')) {
      var list = self.get('sortables').content;
      var sortable_str = '';
      self.originalContent = [];
      self.previousList = [];
      for (var i = 0; i < list.length; i++) {
        sortable_str += '<li class="ui-state-default">' + list[i] + '</li>';
        self.originalContent.pushObject(list[i]);
      }
      (self.$()).empty();
      (self.$()).append(sortable_str);
      var sortable = (self.$()).sortable({
        start: function() { self.sendAction('start') },
        sort: function() { self.sendAction('sort') },
        stop: function() { self.sendAction('stop') },
        change: function() { self.sendAction('change') },
        out: function() { self.sendAction('out') },
        update: self.sortableUpdate.bind(self),
      });
      self.originalContent = [];
      var originalChildren = (self.$()).children();
      for (var i=0; i< originalChildren.length; i++) {
        self.originalContent.pushObject(originalChildren[i].innerHTML);
        self.previousList.pushObject(originalChildren[i].innerHTML);
      }
      (self.$()).disableSelection();
    }
  },
  didInsertElement: function() {
    var self = this;
    if (self.get('sortables')) {
      // extend the list controller with useful methods that can be
      // called by anyone reacting to changes in the content
      self.get('sortables').reopen({
        move : function(from, to) {
          var list = Ember.copy(self.get('sortables').content);
          if ((from > -1) && (from < list.length) && (to > -1) && (to < list.length) && (to != from)) {
            if (to > from) {
              var movingItem = list[from];
              for (var i=from+1; i<to+1; i++) {
                list[i-1] = list[i];
              }
              list[to] = movingItem;
            } else {
              var movingItem = list[from];
              for (var i=from-1; i>to-1; i--) {
                list[i+1] = list[i];
              }
              list[to] = movingItem;
            }
            self.get('sortables').set('content', list);
            self.get('dragInfo').set('item', movingItem);
            self.get('dragInfo').set('oldIndex', from);
            self.get('dragInfo').set('newIndex', to);
          }
        }
      });
      self.buildList(self);
      var observingFn = function() {
        self.buildList(self);
      }
      self.addObserver(self, observingFn, 'content', self.get('sortables'));
    }
  }
});


// Autocomplete - component
Cinder.JquiAutocompleteComponent = Ember.Component.extend(Cinder.BaseComponent, {
  classNames: ['autocomplete'],
  autocompleteSelected: function(event, autocomplete) {
    if (this.autocompleteSelect) {
      this.get('selectedItem').set('value', 'foo');
      this.sendAction('select');
    }
  },
  didInsertElement: function() {
    var self = this;
    if (self.get('items')) {
      var autocomplete = (self.$()).find("input").autocomplete({
        source: self.get('items').get('content'),
        select: function(event, ui) {
          self.get('selectedItem').set('value', $(event.target).val());
        }.bind(self),
        change: function(event, ui) {
          var newVal = $(event.target).val();
          if (self.get('selectedItem').get('value') !== newVal) {
            self.get('selectedItem').set('value', newVal);
          }
        }
      });

      var observingFn = function(observed) {
        autocomplete.autocomplete("option", "source", self.get('items').get('content'));
      };
      self.addObserver(self, observingFn, 'content', self.get('items'));

    }
  }
});


// Button - component
Cinder.JquiButtonComponent = Ember.Component.extend(Cinder.BaseComponent, {
  didInsertElement: function() {
    var self = this;
    var label = self.get('button').get("label");
    var but = (self.$()).find("button");
    but.append(label);
    but.button().click(function(event) {
      event.preventDefault();
      self.get('button').click();
    });

    var observingFn = function(observed) {
      var but = (self.$()).find("button");
      but.find('span').empty().append(self.get('button').get("label"));
    };
    self.addObserver(self, observingFn, 'label', self.get('button'));
  }
});


// Date Picker - Component
Cinder.JquiTooltipComponent = Ember.Component.extend(Cinder.BaseComponent, {
  tagName: 'span',
  didInsertElement: function() {
    var self = this;
    if (self.get('tooltip')) {
      // apply tooltip to all elements, not just the first child
      (self.$()).attr('title', self.get('tooltip').get('tip'));
      // (self.$()).find(":first-child").attr('title', self.valueObject.get("value"));

      var observingFn = function(observed) {
        (self.$()).attr('title', self.get('tooltip').get('tip'));
      };
      self.addObserver(self, observingFn, 'tip', self.get('tooltip'));
    }
  }
});


// Menu - Component
Cinder.JquiMenuComponent = Ember.Component.extend(Cinder.BaseComponent, {
  originalContent: [],
  previousList: [],
  tagName: 'span',
  buildMenu: function() {
    var self = this;
    if (self.get('menu')) {
      var menuStr = '<ul class="cinder-menu">';
      var items = self.get('menu').get('items');
      menuStr += self.buildMenuStr(items);
      menuStr += '</ul>';

      (self.$()).empty();
      (self.$()).append(menuStr);
      (self.$()).find(".cinder-menu").menu({
        select: function(event, ui) {
          var sel = ui.item[0];
          var selectedItem = $(sel).text();
          this.sendAction('itemSelected', selectedItem);
          self.get('menu').set('selection', selectedItem);
        }.bind(self)
      });
    }
  },
  didInsertElement: function() {
    var self = this;
    self.buildMenu();
    var menuChanged = function() {
      self.buildMenu(self);
    }
    self.addObserver(self, menuChanged, 'items', self.get('menu'));
    var items = self.get('menu').content;
  },
  buildMenuStr: function(items) {
    var self = this;
    var itemChanged = function() {
      self.buildMenu(self);
    }
    var str = "";
    for (var i=0; i<items.length; i++) {
      var label = items[i].label;
      if (items[i].items) {
        // we have a sub-menu
        var subItems = items[i].items;
        str += "<li>" + label + "<ul>";
        str += self.buildMenuStr(subItems);
        str += "</li></ul>";
      } else {
        self.addObserver(self, itemChanged, 'disabled', items[i]);
        if (items[i].disabled) {
          str += '<li class="ui-state-disabled">' + label + '</li>';
        } else {
          str += '<li>' + label + '</li>';
        }
      }
    }
    return str;
  }
});


// SelectMenu - Component
Cinder.JquiSelectMenuComponent = Ember.Component.extend(Cinder.BaseComponent, {
  originalContent: [],
  previousList: [],

  buildMenu: function(self) {
    if (self.get('menu')) {
      var nameStr = self.get('menu').get('name') ? 'name="' + self.get('menu').get('name') + '" ' : '';
      var disabledStr = self.get('menu').get('disabled') ? ' disabled="disabled" ' : '';
      var menuStr = '<select ' + nameStr + disabledStr + 'class="cinder-select-menu">';
      var items = self.get('menu').get('items');
      menuStr += self.buildMenuStr(items);
      menuStr += '</select>';

      (self.$()).empty();
      (self.$()).append(menuStr);
      var w = self.width ? self.width : 175;
      (self.$()).find(".cinder-select-menu").selectmenu({
        width: w,
        select: function(event, ui) {
          var selectedItem = ui.item.label;
          this.sendAction('itemSelected', selectedItem);
          self.get('menu').set('selection', selectedItem);
        }.bind(self)
      });
    }
  },
  didInsertElement: function() {
    var self = this;

    if (self.get('menu')) {
      self.buildMenu(self);
      var menuChanged = function() {
        console.log("menu changed");
        self.buildMenu(self);
      }

      self.addObserver(self, menuChanged, 'items', self.get('menu'));
      self.addObserver(self, menuChanged, 'disabled', self.get('menu'));

      var items = self.get('menu').content;
    }
  },
  buildMenuStr: function(items, disabledGroup) {
    var self = this;
    var itemChanged = function() {
      console.log("item enablement changed");
      self.buildMenu(self);
    }
    var str = "";
    for (var i=0; i<items.length; i++) {
      var itemName = items[i].label;
      var disabled = items[i].disabled;
      var selected = items[i].selected;
      var disabledStr = (disabled || disabledGroup) ? ' disabled="true"' : '';
      var selectedStr = selected ? ' selected="selected"' : '';

      self.addObserver(self, itemChanged, 'disabled', items[i]);

      var subItems = items[i].items;
      if (subItems) {
        // we have sub items so use <optgroup> instead of <option>
        str += '<optgroup label="' + itemName + '">';
        str += self.buildMenuStr(subItems, disabled || disabledGroup);
        str += '</optgroup>';
      } else {
        str += '<option' + disabledStr + selectedStr + '>' + itemName + '</option>';
      }
    }
    return str;
  }
});


// Spinner - Component
Cinder.JquiSpinnerComponent = Ember.Component.extend(Cinder.BaseComponent, {

  jquiSpinner: "apple",

  spinnerStop: function(event, spinn) {
    var self = this;
    var inputElement = (self.$()).find("input");
    this.get('spinner').set('value', inputElement.spinner("value"));
    this.sendAction('stop');
  },

  buildSpinner: function(self, firstTime) {
    var step = self.get('step') ? self.get('step') : 1;
    var min = self.get('min') ? self.get('min') : 1;
    var max = self.get('max') ? self.get('max') : 100;
    var w = self.get('width') ? self.get('width') : 175;
    var numberFormat = self.get('numberFormat') ? self.get('numberFormat') : undefined;
    self.jquiSpinner = (self.$()).find("input").spinner({
      step: step,
      min: min,
      max: max,
      numberFormat: numberFormat,
      stop: self.spinnerStop.bind(self)
    });

    if (self.get('spinner')) {
      (self.$()).find("input").spinner("value", self.get('spinner').get('value'));
      var observingFn = function(observed) {
        self.buildSpinner(self);
      };
      if (firstTime) {
        self.addObserver(self, observingFn, 'value', self.get('spinner'));
      }
    }

    if (self.culture) {
      (self.$()).find("input").spinner("option", "culture", self.culture);
    }

  },

  didInsertElement: function() {
    var self = this;
    self.buildSpinner(self, true);
  }
});



document.write('<script type="text/x-handlebars" data-template-name="components/jqui-slider"></script>');
document.write('<script type="text/x-handlebars" data-template-name="components/jqui-datepicker"><input type=\"text\"></script>');
document.write('<script type="text/x-handlebars" data-template-name="components/jqui-progressbar"></script>');
document.write('<script type="text/x-handlebars" data-template-name="components/jqui-tabs"></script>');
document.write('<script type="text/x-handlebars" data-template-name="components/jqui-accordion"></script>');
document.write('<script type="text/x-handlebars" data-template-name="components/jqui-sortable"></script>');
document.write('<script type="text/x-handlebars" data-template-name="components/jqui-autocomplete"><input></script>');
document.write('<script type="text/x-handlebars" data-template-name="components/jqui-button"><button></button></script>');
document.write('<script type="text/x-handlebars" data-template-name="components/jqui-tooltip">{{yield}}</script>');
document.write('<script type="text/x-handlebars" data-template-name="components/jqui-menu"></script>');
document.write('<script type="text/x-handlebars" data-template-name="components/jqui-select-menu"></script>');
document.write('<script type="text/x-handlebars" data-template-name="components/jqui-spinner"><input></script>');

document.write(
              "<script type=\"text/x-handlebars\" data-template-name=\"components/cinder-about-header\">" +
              "<div class=\"hdrftr\"><p>Cinder is an Ember based ease-of-use wrapper around the popular " +
              "jQuery UI library. Widgets can be instantiated on standard Ember data objects.  " +
              "Cinder will provide <i>bi-directional</i> data propagation.<br/><br/>" +
              "</p></div></script>"
              );
document.write(
              "<script type=\"text/x-handlebars\" data-template-name=\"components/cinder-about-footer\">" +
              "<div class=\"hdrftr\"><p><b>*</b> Widgets can be programmatically controlled by " +
              "manipulating the data model. <br/>" +
              "<b>*</b> In many instances, client code will not need to react " +
              "to events directly. Data will automatically be updated " +
              "when relevant events occur (e.g. slider stops sliding " +
              "or the date picker dialog closes).  </p></div></script>"
              );

Cinder.hookupComponents = function(app) {
  app.JquiSliderComponent = Cinder.JquiSliderComponent;
  app.JquiDatepickerComponent = Cinder.JquiDatepickerComponent;
  app.JquiProgressbarComponent = Cinder.JquiProgressbarComponent;
  app.JquiTabsComponent = Cinder.JquiTabsComponent;
  app.JquiAccordionComponent = Cinder.JquiAccordionComponent;
  app.JquiSortableComponent = Cinder.JquiSortableComponent;
  app.JquiAutocompleteComponent = Cinder.JquiAutocompleteComponent;
  app.JquiButtonComponent = Cinder.JquiButtonComponent;
  app.JquiTooltipComponent = Cinder.JquiTooltipComponent;
  app.JquiMenuComponent = Cinder.JquiMenuComponent;
  app.JquiSelectMenuComponent = Cinder.JquiSelectMenuComponent;
  app.JquiSpinnerComponent = Cinder.JquiSpinnerComponent;
  app.CinderAboutHeaderComponent = Cinder.CinderAboutHeader;
  app.CinderAboutFooterComponent = Cinder.CinderAboutFooter;
}



Cinder.View = Ember.Mixin.create({
  observed: null,
  observer: null,
  key: '',
  addObserver: function(observer, callback, key, observed) {
    observed.addObserver(key, callback);
    this.observed = observed;
    this.observer = observer;
    this.key = key;
  },
  willDestroyElement: function() {
    // View is being destroyed
    if (this.observed != null) {
      console.log('removing ' + this.observer + ' as an observer of ' + this.observed + ' for key ' + this.key);
      this.observed.removeObserver(this.key, this.observer);
    }
  }
});
