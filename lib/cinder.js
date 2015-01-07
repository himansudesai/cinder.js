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
Cinder.CinderJquiSliderComponent = Ember.Component.extend(Cinder.BaseComponent, {
  classNames: ['slider'],
  sliderStop: function(event, slider, valueObject) {
    this.valueObject.set('value', slider.value);
    this.sendAction('stop');
  },
  didInsertElement: function() {
    var self = this;
    var slider = (self.$()).slider({
      orientation: self.orientation,
      step: self.step,
      min: self.min,
      max: self.max,
      animate: self.animate,
      disabled: self.disabled,
      stop: self.sliderStop.bind(self),
      change: function() { self.sendAction('change') },
      slide: function() { self.sendAction('slide') },
      start: function() { self.sendAction('start') }
    });
    if (self.valueObject) {
      valueObject = self.valueObject;
      slider.slider({value: self.valueObject.value});
      var observingFn = function(observed) {
        slider.slider("option", "value", self.valueObject.value);
      };
      self.addObserver(self, observingFn, 'value', self.valueObject);
    }
  }
});


// Date Picker - Component
Cinder.CinderJquiDatepickerComponent = Ember.Component.extend(Cinder.BaseComponent, {
  datePickerClose: function(x, y) {
    this.valueObject.set('value', x);
  },
  didInsertElement: function() {
    var self = this;
    var date_picker = (self.$()).find("input").datepicker({
      changeYear: function() { self.sendAction('changeYear') },
      changeMonth: function() { self.sendAction('changeMonth') },
      onClose: self.datePickerClose.bind(self),
    });

    if (self.valueObject) {
      var on = self.valueObject;
      (self.$()).find("input").val(self.valueObject.get('value'));
      var observingFn = function() {
        (self.$()).find("input").val(self.valueObject.get('value'));
      };
      self.addObserver(self, observingFn, 'value', self.valueObject);
    }
  }
});


// Progress Bar - Component
// Supports events: complete
//                  change
// Supported options: ---
Cinder.CinderJquiProgressbarComponent = Ember.Component.extend(Cinder.BaseComponent, {
  didInsertElement: function() {
    var self = this;
    var progress_bar = (self.$()).progressbar({
      complete: function() { self.sendAction('complete'); },
      change: function() { self.sendAction('change'); },
    });
    if (this.valueObject) {
      progress_bar.progressbar({value: this.valueObject.value})
      var observingFn = function(observed) {
        progress_bar.progressbar('value', self.valueObject.value);
      };
      self.addObserver(self, observingFn, 'value', self.valueObject);
    }
  }
});


// Tabs - Component
// Supports events: select
// Supported options: collapsible
Cinder.CinderJquiTabsComponent = Ember.Component.extend(Cinder.BaseComponent, {
  tabSelect: function(event, tabs) {
    this.curTab.set('value', tabs.newTab.index());
  },
  numTabs: 0,
  didInsertElement: function() {
    var rand = Math.floor(Math.random()*500000);
    var self = this;
    if (self.tabs) {
      self.numTabs = self.tabs.content.length;
      var tabs_str = '<ul>';
      for (var i = 0; i < self.numTabs; i++) {
        tabs_str += '<li><a href=\"#tabs-' + rand + '-' + i + '\">' + self.tabs.content[i][0] + '</a></li>';
      }
      tabs_str += '</ul>';

      for (var i = 0; i < self.numTabs; i++) {
        tabs_str += '<div id=\"tabs-' + rand + '-' + i + '\">' + self.tabs.content[i][1] + '</div>';
      }
      (self.$()).append(tabs_str);
      self.tabs.addObserver('content', function() {
        ((self.$()).find('>div')).each(function(index) {
          $(this).html(self.tabs.content[index][1]);
        });
        ((self.$()).find('ul li a')).each(function(index) {
          $(this).text(self.tabs.content[index][0]);
        });
      });
      self.curTab.addObserver('value', function() {
        (self.$()).tabs("option", "active", self.curTab.get('value'));
      });
      (self.$()).tabs({
        activate: self.tabSelect.bind(self),
        collapsible: self.collapsible
      });
     (self.$()).tabs("option", "active", self.curTab.get('value'));
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
Cinder.CinderJquiAccordionComponent = Ember.Component.extend(Cinder.BaseComponent, {
  didInsertElement: function() {
    var self = this;
    self.contentSize = 0;
    if (self.valueObject) {
      self.contentSize = self.valueObject.content.length;
      var hdr = (self.header ? self.header : 'h6');
      var accordion_str = '';
      for (var i = 0; i < self.valueObject.content.length; i++) {
        accordion_str += '<' + hdr + '><a href=\"#\" class=\"cinder-accordian\">' + self.valueObject.content[i][0] + '</a></' + hdr + '>' +
        '<div>' + self.valueObject.content[i][1] + '</div>'
      }
      ((self.$())).append(accordion_str);

      var observingFn = function() {
        (self.$()).find("input").val(self.valueObject.get('value'));
      };

      var observingFn = function() {
        ((self.$()).find('>div')).each(function(index) {
          $(this).html(self.valueObject.content[index][1]);
        });
        ((self.$()).find('h2 a')).each(function(index) {
          $(this).text(self.valueObject.content[index][0]);
        });
      };
      self.addObserver(self, observingFn, 'content', self.valueObject);
    }
    console.log('animated = ' + self.animated);
    console.log('autoheight = ' + self.autoHeight);
    console.log('collapsible = ' + self.collapsible);
    console.log('active = ' + self.active);
    (self.$()).accordion({
      autoHeight: self.autoHeight,
      collapsible: self.collapsible,
      active: self.active,
      animated: self.animated,
      autoHeight: self.autoHeight,
      clearStyle: self.clearStyle,
      fillSpace: self.fillSpace,
      navigation: self.navigation,
      event: self.event,
      disabled: self.disabled
    });
    if (self.onChange) {
      ((self.$())).bind("accordionchange", self.onChange);
    }
  }
});


// Sortable - Component
Cinder.CinderJquiSortableComponent = Ember.Component.extend(Cinder.BaseComponent, {
  originalContent: [],
  previousList: [],
  tagName: 'ul',
  sortableUpdate: function(event, sortable) {
    var emberView = this;
    var draggedItem = event.srcElement;
    if (draggedItem == undefined) {
      var ulElement = event.target;
      var liElements = $(ulElement).find('li');
      var newList = [];
      liElements.each(function(index, ele) {
        newList.push(ele.innerHTML);
        console.log('ITEM ' + ele.innerHTML);
      });
      var changeRangeMin;
      var changeRangeMax;
      for (var i=0; i<emberView.previousList.length; i++) {
        if (emberView.previousList[i] != newList[i]) {
          if (changeRangeMin == undefined) {
            changeRangeMin = i;
          } else {
            changeRangeMax = i;
          }
        }
      }
      if ( (changeRangeMin != undefined) && (changeRangeMax != undefined) ) {
        if (emberView.previousList[changeRangeMin] == newList[changeRangeMax]) {
          changeIndex = changeRangeMin;
          draggedItem = emberView.previousList[changeRangeMin];
        } else if (emberView.previousList[changeRangeMax] == newList[changeRangeMin]) {
          changeIndex = changeRangeMax;
          draggedItem = emberView.previousList[changeRangeMax];
        }
      }
      emberView.set('previousList', newList);
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
      emberView.sortables.dragInfo.set('item', draggedItem);
      emberView.sortables.dragInfo.set('oldIndex', emberView.originalContent.indexOf(draggedItem));
      emberView.sortables.dragInfo.set('newIndex', newContent.indexOf(draggedItem));
      emberView.sortables.set('content', newContent);
    }
  },
  buildList: function(self) {
    if (self.sortables) {
      var list = self.sortables.content;
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
    if (self.sortables) {
      // extend the list controller with useful methods that can be
      // called by anyone reacting to changes in the content
      self.sortables.reopen({
        move : function(from, to) {
          var list = Ember.copy(self.sortables.content);
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
            self.sortables.set('content', list);
            self.sortables.dragInfo.set('item', movingItem);
            self.sortables.dragInfo.set('oldIndex', from);
            self.sortables.dragInfo.set('newIndex', to);
          }
        },
        dragInfo : Ember.Object.create({
          item: null,
          oldIndex: -1,
          newIndex: -1
        })
      });
      self.buildList(self);
      var observingFn = function() {
        self.buildList(self);
      }
      self.addObserver(self, observingFn, 'content', self.sortables);
    }
  }
});


// Autocomplete - component
Cinder.CinderJquiAutocompleteComponent = Ember.Component.extend(Cinder.BaseComponent, {
  classNames: ['autocomplete'],
  autocompleteSelected: function(event, autocomplete) {
    if (this.autocompleteSelect) {
      this.selectedItem.set('value', 'foo');
      this.sendAction('select');
    }
  },
  didInsertElement: function() {
    var self = this;
    if (self.items) {
      var autocomplete = (self.$()).find("input").autocomplete({
        source: self.items.get('content'),
        select: function(event, ui) {
          self.selectedItem.set('value', $(event.target).val());
        }.bind(self),
        change: function(event, ui) {
          var newVal = $(event.target).val();
          if (self.selectedItem.get('value') !== newVal) {
            self.selectedItem.set('value', newVal);
          }
        }
      });

      var observingFn = function(observed) {
        autocomplete.autocomplete("option", "source", self.items.get('content'));
      };
      self.addObserver(self, observingFn, 'content', self.items);

    }
  }
});


// Button - component
Cinder.CinderJquiButtonComponent = Ember.Component.extend(Cinder.BaseComponent, {
  didInsertElement: function() {
    var self = this;
    var label = self.button.get("label");
    var but = (self.$()).find("button");
    but.append(label);
    but.button().click(function(event) {
      event.preventDefault();
      self.button.click();
    });

    var observingFn = function(observed) {
      var but = (self.$()).find("button");
      but.find('span').empty().append(self.button.get("label"));
    };
    self.addObserver(self, observingFn, 'label', self.button);
  }
});

// Date Picker - Component
Cinder.CinderJquiTooltipComponent = Ember.Component.extend(Cinder.BaseComponent, {
  tagName: 'span',
  didInsertElement: function() {
    var self = this;
    if (self.valueObject) {
      (self.$()).find(":first-child").attr('title', self.valueObject.get("value"));
    }
    // var date_picker = (self.$()).find("input").datepicker({
    //   changeYear: function() { self.sendAction('changeYear') },
    //   changeMonth: function() { self.sendAction('changeMonth') },
    //   onClose: self.datePickerClose.bind(self),
    // });
    //
    // if (self.valueObject) {
    //   var on = self.valueObject;
    //   (self.$()).find("input").val(self.valueObject.get('value'));
    //   var observingFn = function() {
    //     (self.$()).find("input").val(self.valueObject.get('value'));
    //   };
    //   self.addObserver(self, observingFn, 'value', self.valueObject);
    // }
  }
});


document.write('<script type="text/x-handlebars" data-template-name="components/cinder-jqui-slider"></script>');
document.write('<script type="text/x-handlebars" data-template-name="components/cinder-jqui-datepicker"><input type=\"text\"></script>');
document.write('<script type="text/x-handlebars" data-template-name="components/cinder-jqui-progressbar"></script>');
document.write('<script type="text/x-handlebars" data-template-name="components/cinder-jqui-tabs"></script>');
document.write('<script type="text/x-handlebars" data-template-name="components/cinder-jqui-accordion"></script>');
document.write('<script type="text/x-handlebars" data-template-name="components/cinder-jqui-sortable"></script>');
document.write('<script type="text/x-handlebars" data-template-name="components/cinder-jqui-autocomplete"><input></script>');
document.write('<script type="text/x-handlebars" data-template-name="components/cinder-jqui-button"><button></button></script>');
document.write('<script type="text/x-handlebars" data-template-name="components/cinder-jqui-tooltip">{{yield}}</script>');
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
  app.CinderJquiSliderComponent = Cinder.CinderJquiSliderComponent;
  app.CinderJquiDatepickerComponent = Cinder.CinderJquiDatepickerComponent;
  app.CinderJquiProgressbarComponent = Cinder.CinderJquiProgressbarComponent;
  app.CinderJquiTabsComponent = Cinder.CinderJquiTabsComponent;
  app.CinderJquiAccordionComponent = Cinder.CinderJquiAccordionComponent;
  app.CinderJquiSortableComponent = Cinder.CinderJquiSortableComponent;
  app.CinderJquiAutocompleteComponent = Cinder.CinderJquiAutocompleteComponent;
  app.CinderJquiButtonComponent = Cinder.CinderJquiButtonComponent;
  app.CinderJquiTooltipComponent = Cinder.CinderJquiTooltipComponent;
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




// Slider - View.  Automatic 2-way binding if valueObject is provided
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
Cinder.SliderView = Ember.View.extend(Cinder.View, {
  template: Handlebars.compile(''),
  sliderStop: function(event, slider) {
    console.log("++++ slider stop");
    var emberView = Cinder.uiEvent('stop', event, slider, this);
    if (emberView.valueObject) {
      emberView.valueObject.set('value', slider.value);
    }
  },
  didInsertElement: function() {
  var self = this;
    var slider = (self.$()).slider({
      slide: function(event, slider) { Cinder.uiEvent('slide', event, slider, this);},
      start: function(event, slider) { Cinder.uiEvent('start', event, slider, this);},
      change: function(event, slider) { Cinder.uiEvent('change', event, slider, this);},
      stop: self.sliderStop,
      orientation: self.orientation,
      step: self.step,
      min: self.min,
      max: self.max,
      animate: self.animate,
      disabled: self.disabled
    });
    if (self.valueObject) {
      slider.slider({value: self.valueObject.value});
      var observingFn = function(observed) {
        slider.slider("option", "value", self.valueObject.value);
      };
      self.addObserver(self, observingFn, 'value', self.valueObject);
    }
  }
});


// Date Picker - View
Cinder.DatePickerView = Ember.View.extend(Cinder.View, {
  template: Handlebars.compile('<input type=\"text\"></input>'),
  datePickerClose: function(x, y) {
    var parentView = $(this).parent();
    var parentId = parentView.attr("id");
    var emberView = Ember.View.views[parentId];
    if (emberView.valueObject) {
      emberView.valueObject.set('value', x);
    }
    if (emberView.onClose) {
      emberView.onClose(x, y);
    }
  },

  didInsertElement: function() {
    var self = this;
    var date_picker = (self.$()).find("input").datepicker({
      changeYear: self.changeYear,
      changeMonth: self.changeMonth,
      onClose: self.datePickerClose,
      onChangeMonthYear: self.onChangeMonthYear
    });

    if (self.valueObject) {
      var on = self.valueObject;
      (self.$()).find("input").val(self.valueObject.get('value'));
      var observingFn = function() {
        (self.$()).find("input").val(self.valueObject.get('value'));
      };
      self.addObserver(self, observingFn, 'value', self.valueObject);
    }
  }
});


// Accordion- View
// Supported options: autoHeight
//                    collapsible
//                    active
//                    animated
//                    autoHeight
//                    disabled
//                    fillSpace
//                    navigation
//                    event
Cinder.AccordionView = Ember.View.extend(Cinder.View, {
  template: Handlebars.compile(''),
  didInsertElement: function() {
    var self = this;
    self.contentSize = 0;
    if (self.valueObject) {
      self.contentSize = self.valueObject.content.length;
      var hdr = (self.header ? self.header : 'h6');
      var accordion_str = '';
      for (var i = 0; i < self.valueObject.content.length; i++) {
        accordion_str += '<' + hdr + '><a href=\"#\" class=\"cinder-accordian\">' + self.valueObject.content[i][0] + '</a></' + hdr + '>' +
        '<div>' + self.valueObject.content[i][1] + '</div>'
      }
      ((self.$())).append(accordion_str);

      var observingFn = function() {
        (self.$()).find("input").val(self.valueObject.get('value'));
      };

      var observingFn = function() {
        ((self.$()).find('>div')).each(function(index) {
          $(this).html(self.valueObject.content[index][1]);
        });
        ((self.$()).find('h2 a')).each(function(index) {
          $(this).text(self.valueObject.content[index][0]);
        });
      };
      self.addObserver(self, observingFn, 'content', self.valueObject);
    }
    console.log('animated = ' + self.animated);
    console.log('autoheight = ' + self.autoHeight);
    console.log('collapsible = ' + self.collapsible);
    console.log('active = ' + self.active);
    (self.$()).accordion({
      autoHeight: self.autoHeight,
      collapsible: self.collapsible,
      active: self.active,
      animated: self.animated,
      autoHeight: self.autoHeight,
      clearStyle: self.clearStyle,
      fillSpace: self.fillSpace,
      navigation: self.navigation,
      event: self.event,
      disabled: self.disabled
    });
    if (self.onChange) {
      ((self.$())).bind("accordionchange", self.onChange);
    }
  }
});


// Supports events: complete
//                  change
// Supported options: ---
Cinder.ProgressBarView = Ember.View.extend(Cinder.View, {
  template: Handlebars.compile(''),
  didInsertElement: function() {
    var self = this;
    var progress_bar = (self.$()).progressbar({
      complete: function(event, progressbar) {Cinder.uiEvent('complete', event, progressbar, this);},
      change: function(event, progressbar) {Cinder.uiEvent('change', event, progressbar, this);}
    });
    if (this.valueObject) {
      progress_bar.progressbar({value: this.valueObject.value})
      var observingFn = function(observed) {
        progress_bar.progressbar('value', self.valueObject.value);
      };
      self.addObserver(self, observingFn, 'value', self.valueObject);
    }
  }
});


// Tabs - View
// Supports events: select
// Supported options: collapsible
Cinder.TabsView = Ember.View.extend(Cinder.View, {
  template: Handlebars.compile(''),
  tabSelect: function(event, tabs) {
    var emberView = Cinder.uiEvent('active', event, tabs, this);
    if (emberView.curTab) {
      emberView.curTab.set('value', tabs.newTab.index());
    }
  },
  numTabs: 0,
  didInsertElement: function() {
    var rand = Math.floor(Math.random()*500000);
    var self = this;
    if (self.tabs) {
      self.numTabs = self.tabs.content.length;
      var tabs_str = '<ul>';
      for (var i = 0; i < self.numTabs; i++) {
        tabs_str += '<li><a href=\"#tabs-' + rand + '-' + i + '\">' + self.tabs.content[i][0] + '</a></li>';
      }
      tabs_str += '</ul>';

      for (var i = 0; i < self.numTabs; i++) {
        tabs_str += '<div id=\"tabs-' + rand + '-' + i + '\">' + self.tabs.content[i][1] + '</div>';
      }

      (self.$()).append(tabs_str);
      self.tabs.addObserver('content', function() {
        ((self.$()).find('>div')).each(function(index) {
          $(this).html(self.tabs.content[index][1]);
        });
        ((self.$()).find('ul li a')).each(function(index) {
          $(this).text(self.tabs.content[index][0]);
        });
      });
      self.curTab.addObserver('value', function() {
        (self.$()).tabs("option", "active", self.curTab.get('value'));
      });
      (self.$()).tabs({
        activate: self.tabSelect,
        collapsible: self.collapsible
      });
      (self.$()).tabs("option", "active", self.curTab.get('value'));
    }
  }
});


// Sortable - View
// Supports events: ---
// Supported options: ---
Cinder.SortableView = Ember.View.extend(Cinder.View, {
  template: Handlebars.compile(''),
  originalContent: [],
  previousList: [],
  tagName: 'ul',
  sortableUpdate: function(event, sortable) {
    var emberView = Cinder.uiEvent('update', event, sortable, this);
    var draggedItem = event.srcElement;
    if (draggedItem == undefined) {
      var ulElement = event.target;
      var liElements = $(ulElement).find('li');
      var newList = [];
      liElements.each(function(index, ele) {
        newList.push(ele.innerHTML);
        console.log('ITEM ' + ele.innerHTML);
      });
      var changeRangeMin;
      var changeRangeMax;
      for (var i=0; i<emberView.previousList.length; i++) {
        if (emberView.previousList[i] != newList[i]) {
          if (changeRangeMin == undefined) {
            changeRangeMin = i;
          } else {
            changeRangeMax = i;
          }
        }
      }
      if ( (changeRangeMin != undefined) && (changeRangeMax != undefined) ) {
        if (emberView.previousList[changeRangeMin] == newList[changeRangeMax]) {
          changeIndex = changeRangeMin;
          draggedItem = emberView.previousList[changeRangeMin];
        } else if (emberView.previousList[changeRangeMax] == newList[changeRangeMin]) {
          changeIndex = changeRangeMax;
          draggedItem = emberView.previousList[changeRangeMax];
        }
      }
      emberView.set('previousList', newList);
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
      emberView.sortables.dragInfo.set('item', draggedItem);
      emberView.sortables.dragInfo.set('oldIndex', emberView.originalContent.indexOf(draggedItem));
      emberView.sortables.dragInfo.set('newIndex', newContent.indexOf(draggedItem));
      emberView.sortables.set('content', newContent);
    }
  },
  buildList: function(self) {
    if (self.sortables) {
      var list = self.sortables.content;
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
        start: function(event, sortable) {Cinder.uiEvent('start', event, sortable, this);},
        sort: function(event, sortable) {Cinder.uiEvent('sort', event, sortable, this);},
        stop: function(event, sortable) {Cinder.uiEvent('stop', event, sortable, this);},
        change: function(event, sortable) {Cinder.uiEvent('change', event, sortable, this);},
        update: self.sortableUpdate,
        out: function(event, sortable) {Cinder.uiEvent('out', event, sortable, this);},
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
    if (self.sortables) {
      // extend the list controller with useful methods that can be
      // called by anyone reacting to changes in the content
      self.sortables.reopen({
        move : function(from, to) {
          var list = Ember.copy(self.sortables.content);
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
            self.sortables.set('content', list);
            self.sortables.dragInfo.set('item', movingItem);
            self.sortables.dragInfo.set('oldIndex', from);
            self.sortables.dragInfo.set('newIndex', to);
          }
        },
        dragInfo : Ember.Object.create({
          item: null,
          oldIndex: -1,
          newIndex: -1
        })
      });
      self.buildList(self);
      var observingFn = function() {
        self.buildList(self);
      }
      self.addObserver(self, observingFn, 'content', self.sortables);
    }
  }
});


// Draggable - View.
// Supports events: start
//                  stop
// Supported options: containment
//                    axis
//                    revert
//                    zIndex
//                    snapTolerance
//                    snapMode
//                    snap
//                    scope
Cinder.DraggableView = Ember.View.extend(Cinder.View, {
  template: Handlebars.compile(''),
  didInsertElement: function() {
    var self = this;
    var draggable = (self.$()).draggable({
      start: function(event, draggable) { Cinder.uiEvent('start', event, draggable, this)},
      stop: function(event, draggable) { Cinder.uiEvent('stop', event, draggable, this)},
      containment: self.containment,
      axis: self.axis,
      revert: self.revert,
      zIndex: self.zIndex,
      scope: self.scope,
      snap: self.snap,
      snapMode: self.snapMode,
      snapTolerance: self.snapTolerance
    });
  }
});


// Droppable - View.
// Supports events: ---
// Supported options: ---
Cinder.DroppableView = Ember.View.extend(Cinder.View, {
  template: Handlebars.compile(''),
  dropped: function(event, ui) {
    if (ui != null) {
      var draggable = (ui['draggable'])[0];
      if (draggable != null && draggable.id != null) {
        var emberView = Ember.View.views[draggable.id];
        Cinder.uiEvent('drop', event, emberView, this);
      }
    }
  },
  didInsertElement: function() {
    var self = this;
    var droppable = (self.$()).droppable({
      drop: self.dropped,
      over: function(event, droppable) { Cinder.uiEvent('over', event, droppable, this);},
      out: function(event, droppable) { Cinder.uiEvent('out', event, droppable, this);},
      disabled: self.disabled,
      accept: self.accept,
      activeClass: self.activeClass,
      hoverClass: self.hoverClass,
      tolerance: self.tolerance,
      scope: self.scope
    });
  }
});


// About Cinder - Header
document.write("<script type=\"text/x-handlebars\" data-template-name=\"cinder-about-hdr\"><div id=\"about-hdr\">" +
                    "<p>Cinder is an Ember based ease-of-use wrapper around the popular " +
                    "jQuery UI library. Widgets can be instantiated on standard Ember data objects.  " +
                    "Cinder will provide <i>bi-directional</i> data propagation.<br/><br/>" +
                    "</p></div></script>");

Cinder.AboutHdr = Ember.View.extend({
  templateName: 'cinder-about-hdr'
});
// About Cinder - Footer
document.write("<script type=\"text/x-handlebars\" data-template-name=\"cinder-about-ftr\"><div id=\"about-ftr\">" +
                    "<p><b>*</b> Widgets can be programmatically controlled by " +
                    "manipulating the data model. <br/>" +
                    "<b>*</b> In many instances, client code will not need to react " +
                    "to events directly. Data will automatically be updated " +
                    "when relevant events occur (e.g. slider stops sliding " +
                    "or the date picker dialog closes).  </p></div></script>");
// About Cinder - View
Cinder.AboutFtr = Ember.View.extend({
  templateName: 'cinder-about-ftr'
});
