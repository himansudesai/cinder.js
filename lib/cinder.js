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

Cinder.View = Ember.View.extend({
  willDestroyElement: function() {
    // View is being destroyed
  }
});

// Slider - Template
document.write("<script type=\"text/x-handlebars\" data-template-name=\"cinder-slider\"></script>");

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
Cinder.SliderView = Cinder.View.extend({
  templateName: 'cinder-slider',

  sliderStop: function(event, slider) {
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
      self.valueObject.addObserver('value', function(observed) {
        slider.slider("option", "value", self.valueObject.value);
      });
    }
  }
});


// Date Picker - Template
document.write("<script type=\"text/x-handlebars\" data-template-name=\"cinder-datepicker\"><input type=\"text\"></input></script>");
// Date Picker - View
Cinder.DatePickerView = Cinder.View.extend({
  templateName: 'cinder-datepicker',

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
      self.valueObject.addObserver('value', function() {
        (self.$()).find("input").val(self.valueObject.get('value'));
      });
    }
  }
});


// Accordion - Template
document.write("<script type=\"text/x-handlebars\" data-template-name=\"cinder-accordion\"></script>");
// Accordion- View
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
Cinder.AccordionView = Cinder.View.extend({
  templateName: 'cinder-accordion',

  didInsertElement: function() {
    var self = this;
    self.contentSize = 0;
    if (self.valueObject) {
      self.contentSize = self.valueObject.content.length;
      var hdr = (self.header ? self.header : 'h6');
      var accordion_str = '';
      for (var i = 0; i < self.valueObject.content.length; i++) {
        accordion_str += '<' + hdr + '><a href=\"#\">' + self.valueObject.content[i][0] + '</a></' + hdr + '>' +
        '<div>' + self.valueObject.content[i][1] + '</div>'
      }
      ((self.$())).append(accordion_str);
      self.valueObject.addObserver('content', function() {
        console.log('reacting to accordion');
        ((self.$()).find('div')).each(function(index) {
          $(this).text(self.valueObject.content[index][1]);
        });
        ((self.$()).find('h2 a')).each(function(index) {
          $(this).text(self.valueObject.content[index][0]);
        });
      });
    }
    console.log('animated = ' + self.animated);
    console.log('autoheight = ' + self.autoHeight);
    console.log('collapsible = ' + self.collapsible);
    console.log('active = ' + self.active);
    ((self.$())).accordion({
      autoHeight: self.autoHeight,
      collapsible: self.collapsible,
      active: self.active,
      animated: self.animated,
      autoHeight: self.autoHeight,
      clearStyle: self.clearStyle,
      fillSpace: self.fillSpace,
      navigation: self.navigation,
      event: self.event,
      disabled: self.disabled,
      change: function(event, accordion) {Cinder.uiEvent('change', event, accordion, this);},
      changestart: function(event, accordion) {Cinder.uiEvent('changestart', event, accordion, this);}
    });
    if (self.onChange) {
      ((self.$())).bind("accordionchange", self.onChange);
    }
  }
});


// Progressbar - Template
document.write("<script type=\"text/x-handlebars\" data-template-name=\"cinder-progressbar\"></script>");
// Progressbar - View
Cinder.ProgressBarView = Cinder.View.extend({
  templateName: 'cinder-progressbar',
  didInsertElement: function() {
    var self = this;
    if (this.valueObject) {
      var progress_bar = (self.$()).progressbar({value: this.valueObject.value, complete: this.complete });
      this.valueObject.addObserver('value', function(observed) {
        progress_bar.progressbar('value', self.valueObject.value);
      });
    }
  }
});


// Tabs - Template
document.write("<script type=\"text/x-handlebars\" data-template-name=\"cinder-tabs\"><div></div></script>");
// Tabs - View
Cinder.TabsView = Cinder.View.extend({
  templateName: 'cinder-tabs',
  
  tabSelect: function(event, ui) {
    var parentView = $(this).parent();
    var parentId = parentView.attr("id");
    var emberView = Ember.View.views[parentId];
    if (emberView.curTab) {
      emberView.curTab.set('value', ui.index);
    }
  },

  didInsertElement: function() {
    var rand = Math.floor(Math.random()*500000);
    var self = this;
    self.contentSize = 0;
    if (self.tabs) {
      self.contentSize = self.tabs.content.length;
      var tabs_str = '<ul>';
      for (var i = 0; i < self.tabs.content.length; i++) {
        tabs_str += '<li><a href=\"#tabs-' + rand + '-' + i + '\">' + self.tabs.content[i][0] + '</a></li>';
      }
      tabs_str += '</ul>';

      for (var i = 0; i < self.tabs.content.length; i++) {
        tabs_str += '<div id=\"tabs-' + rand + '-' + i + '\">' + self.tabs.content[i][1] + '</div>';
      }

      ((self.$()).find('div')).append(tabs_str);
      self.tabs.addObserver('content', function() {
        console.log('content changed');
        ((self.$()).find('div div')).each(function(index) {
          $(this).text(self.tabs.content[index][1]);
        });
        ((self.$()).find('div ul li a')).each(function(index) {
          $(this).text(self.tabs.content[index][0]);
        });
      });
      self.curTab.addObserver('value', function() {
        ((self.$()).find('div')).tabs("select", self.curTab.get('value'));
      });
      ((self.$()).find('div')).tabs({
        select: self.tabSelect
      });
      ((self.$()).find('div')).tabs("select", self.curTab.get('value'));
    }
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
                    "or the date picker dialog closes).  If app specific subclasses of " +
                    "Cinder Views are used, and have event handlers defined, " +
                    "they will get called as well.</p></div></script>");
// About Cinder - View
Cinder.AboutFtr = Ember.View.extend({
  templateName: 'cinder-about-ftr'
});
