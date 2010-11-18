<!--
  /**
   * Initializing the Linked Data object
   */
  var LinkedData;
  if (!LinkedData) {
    LinkedData = {};
  } else if (typeof LinkedData != 'object') {
    throw new Error('LinkedData already exists and is not an object.');
  }
  if (!LinkedData.API) {
    LinkedData.API = {};
  } else if (typeof LinkedData.API != 'object') {
    throw new Error('LinkedData.API already exists and is not an object.');
  }
  if (!LinkedData.API.data) {
    LinkedData.API.data = {};
  } else if (typeof LinkedData.API.data != 'object') {
    throw new Error('LinkedData.API.data already exists and is not an object.');
  }

  if (!LinkedData.API.data.Context) {
    LinkedData.API.data.Context = {};
  } else if (typeof LinkedData.API.data.Context != 'object') {
    throw new Error(
        'LinkedData.API.data.Context already exists and is not an object.');
  }
  LinkedData.API.data.Context._mappings = {};
  if (!LinkedData.API.data.Query) {
    LinkedData.API.data.Query = {};
  } else if (typeof LinkedData.API.data.Query != 'object') {
    throw new Error(
        'LinkedData.API.data.Query already exists and is not an object.');
  }
  if (!LinkedData.API.data.Store) {
    LinkedData.API.data.Store = {};
  } else if (typeof LinkedData.API.data.Store != 'object') {
    throw new Error(
        'LinkedData.API.data.Store already exists and is not an object.');
  }
  if (!LinkedData.API.data.Parser) {
    LinkedData.API.data.Parser = {};
  } else if (typeof LinkedData.API.data.Parser != 'object') {
    throw new Error(
        'LinkedData.API.data.Parser already exists and is not an object.');
  }
  if (!LinkedData.API.PropertyGroup) {
    LinkedData.API.PropertyGroup = {};
  } else if (typeof LinkedData.API.PropertyGroup != 'object') {
    throw new Error(
        'LinkedData.API.PropertyGroup already exists and is not an object.');
  }
  if (!LinkedData.API.PlainLiteral) {
    LinkedData.API.PlainLiteral = {};
  } else if (typeof LinkedData.API.PlainLiteral != 'object') {
    throw new Error(
        'LinkedData.API.PlainLiteral already exists and is not an object.');
  }  
  if (!LinkedData.API.TypedLiteral) {
    LinkedData.API.TypedLiteral = {};
  } else if (typeof LinkedData.API.TypedLiteral != 'object') {
    throw new Error(
        'LinkedData.API.TypedLiteral already exists and is not an object.');
  }  
  if (!LinkedData.API.IRI) {
    LinkedData.API.IRI = {};
  } else if (typeof LinkedData.API.IRI != 'object') {
    throw new Error(
        'LinkedData.API.IRI already exists and is not an object.');
  }    
  if (!LinkedData.API.utility) {
    LinkedData.API.utility = {};
  } else if (typeof LinkedData.API.utility != 'object') {
    throw new Error(
        'LinkedData.API.utility already exists and is not an object.');
  }
  LinkedData.API.utility.lastId_ = -1;
  LinkedData.API.utility.startsWith_ = function(string, char) {
    if (!string || string.length === 0) {
      return false;
    }
    return (char === string.charAt(string[0]));
  }
  LinkedData.API.utility.endsWith_ = function(string, char) {
    if (!string || string.length === 0) {
      return false;
    }
    return (char === string.charAt(string.length - 1));
  }  
  LinkedData.API.utility.contains_ = function(a, obj) {
    var i = a.length;
    while (i--) {
      if (a[i] === obj) {
        return true;
      }
    }
    return false;
  }
  LinkedData.API.utility.getUniqueId_ = function() {
    return ++LinkedData.API.utility.lastId_;
  }  
  LinkedData.API.utility.isArray_ = function(array) {
    return Object.prototype.toString.call(array) === "[object Array]";
  }
  LinkedData.API.utility.isObjectElsewhere_ = function(currentNode, rootNode) {
    var objectCounter = 0;
    var parent = currentNode;  
    while((parent) && (parent != rootNode)) {
      if ((parent.hasAttribute) &&
          (parent.nodeName !== 'BODY') &&
          (parent.nodeName !== 'HTML') &&
          (parent.hasAttribute('about'))) {        
        objectCounter++;
      }
      if (objectCounter > 0) {
        return true;
      }
      parent = parent.parentNode;
    }
    return false;
  }
  LinkedData.API.utility.createPropertyGroups_ = function(items, opt_mappings) {    
    var propertyGroups = [];
    for (var i = 0, length1 = items.length; i < length1; i++) { 
      var xPathQuery = './/*[@property] | .//*[@rel] | .//*[@rev]';
      var xPathResult = document.evaluate(
          xPathQuery,
          items[i],
          null,
          XPathResult.ANY_TYPE,
          null);  
      var values = '';      
      var properties = [];      
      if (items[i].hasAttribute('property')) {
        values = items[i].getAttribute('property');
      } else if (items[i].hasAttribute('rel')) {
        values = items[i].getAttribute('rel');
      } else if (items[i].hasAttribute('rev')) {
        values = items[i].getAttribute('rev');
      } 
      if (values) {   
        values = values.trim().split(/\s+/);
        for (var j = 0, length2 = values.length; j < length2; j++) {
          if (!LinkedData.API.utility.contains_(properties, values[j])) {    
            properties.push(values[j]);
          }
        }             
      }
      var node;        
      while (node = xPathResult.iterateNext()) {        
        if (!LinkedData.API.utility.isObjectElsewhere_(node, items[i])) {
          var values;
          if (node.hasAttribute('property')) {
            values = node.getAttribute('property');
          } else if (node.hasAttribute('rel')) {
            values = node.getAttribute('rel');
          } else if (node.hasAttribute('rev')) {
            values = node.getAttribute('rev');
          }    
          values = values.trim().split(/\s+/);
          for (var j = 0, length2 = values.length; j < length2; j++) {
            if (!LinkedData.API.utility.contains_(properties, values[j])) {    
              properties.push(values[j]);
            }
          }
        }
      }
      var propertyGroup =
          new LinkedData.API.PropertyGroup(items[i], properties, opt_mappings);
      propertyGroups.push(propertyGroup);
    }
    return propertyGroups
  }
  // subject: @about, @src
  // property: @property, @rel, @rev
  // object: @href, @resource, @content, firstChild     
  LinkedData.API.utility.checkNodeForTriples_ = function(node) {
    // make sure that there are attributes allowed at the current node
    if (!node.hasAttribute) {
      return false;
    }
    if ((node.hasAttribute('src')) || 
        (node.hasAttribute('about')) ||
        (node.hasAttribute('typeof'))) {
      var rdfTriples = [];        
      var subject;
      if (node.hasAttribute('src')) {
        subject = node.getAttribute('src');
      } else if (node.hasAttribute('about')) {
        if ((node.getAttribute('about').length > 0) &&
            (node.getAttribute('about') !== '/')) {
          subject = node.getAttribute('about');
        } else {
          subject = document.location.href;
          node.setAttribute('about', subject);
        }
      }
      if (node.hasAttribute('typeof')) {
        var subject = '';
        if (node.hasAttribute('href')) {
          subject = node.getAttribute('href');
          if (subject === '' || subject === '/') {
            subject = document.location.href;
          }
        } else if (node.hasAttribute('about')) {
          subject = node.getAttribute('about');
          if (subject === '' || subject === '/') {
            subject = document.location.href;
          }
        }
        if (subject) {            
          var property = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
          var object = node.getAttribute('typeof');
          object = object.trim().split(/\s+/);
          for (var i = 0, length = object.length; i < length; i++) {
            var rdfTriple =
                new LinkedData.API.RDFTriple(subject, property, object[i]);
            rdfTriples.push(rdfTriple);
          }
        }
      }
      var items = LinkedData.API.getItemsBySubject(subject, null, node);        
      for (var i = 0, length1 = items.length; i < length1; i++) {                  
        var properties = items[i].properties;
        for (var j = 0, length2 = properties.length; j < length2; j++) {
          var property = properties[j];            
          var objects = items[i].get(property);
          if (LinkedData.API.utility.isArray_(objects)) {
            for (var k = 0, length3 = objects.length; k < length3; k++) {              
              if (typeof objects[k] === 'string') {
                var object;
                if (objects[k].length > 0 && objects[k] !== '/') {
                  object = objects[k];
                } else {
                  object = document.location.href;
                }
                var rdfTriple =
                    new LinkedData.API.RDFTriple(subject, property, object);    
                rdfTriples.push(rdfTriple);
              }
            }
          }
        }
      }
      return rdfTriples;
    } else {
      return false;
    }
  }          

  /**
   * Retrieves a list of DOM Nodes by the type of data that they express, such
   * as foaf:Person.
   */
  LinkedData.API.getElementsByType = function(type) {
    var isCurie = type.indexOf('http') === 0? false : true;
    var curieType;
    var nonCurieType;
    typeComponents = type.trim().split(':');
    if (isCurie) {  
      curieType = type;
      nonCurieType =
          LinkedData.API.data.Context.getMapping(typeComponents[0]) + 
          typeComponents[1];
    } else {
      curieType =
          LinkedData.API.data.Context.getMapping(typeComponents[0]) + 
          ':' + typeComponents[1];    
      nonCurieType = type;
    }
    var xPathQuery =
        '//*[@typeof[contains(., \'' + nonCurieType + '\')]] | ' +
        '//*[@typeof[contains(., \'' + curieType + '\')]]';            
    var xPathResult = document.evaluate(
        xPathQuery,
        document,
        null,
        XPathResult.ANY_TYPE,
        null);  
    var nodes = [];  
    var node;  
    while (node = xPathResult.iterateNext()) {
      nodes.push(node);
    }
    return nodes;   
  }

  /**
   * Retrieves a list of DOM Nodes by the subject associated with the data that
   * they express, such as http://example.org/people#bob.
   */
  LinkedData.API.getElementsBySubject = function(subject, opt_rootNode) {
    // a short subject is e.g. '#me'
    // a long subject is e.g. 'http://example.org/#me'
    var isShortSubject = LinkedData.API.utility.startsWith_(subject, '#');
    var xPathQuery;
    if (isShortSubject) {
      var shortSubject = subject;
      var hasFragment = document.location.href.indexOf('#');
      var longSubject = hasFragment !== false?
          document.location.href.substring(0, hasFragment) + subject :
          document.location.href + subject;
      xPathQuery =
          '//*[@about=\'' + longSubject + '\'] | ' +
          '//*[@about=\'' + shortSubject + '\'] | ' +
          '//*[@src=\'' + longSubject + '\'] | ' +
          '//*[@src=\'' + shortSubject + '\']';          
    } else {
      xPathQuery =
          '//*[@about=\'' + subject + '\'] | ' +
          '//*[@src=\'' + subject + '\']';
    }
    var rootNode = (opt_rootNode? opt_rootNode : document);
    var xPathResult = document.evaluate(
        xPathQuery,
        rootNode,
        null,
        XPathResult.ANY_TYPE,
        null);  
    var nodes = [];  
    var node;  
    while (node = xPathResult.iterateNext()) {
      nodes.push(node);
    }
    return nodes;  
  }
  
  /**
   * Retrieves a list of DOM Nodes by a particular property and optional value
   * that each expresses.
   */
  LinkedData.API.getElementsByProperty = function(
      property,
      opt_value, 
      opt_rootNode) {
    var isCurie = property.indexOf('http') === 0? false : true;
    var curieProperty;
    var nonCurieProperty;
    var propertyComponents = property.trim().split(':');
    if (isCurie) {  
      curieProperty = property;
      nonCurieProperty =
          LinkedData.API.data.Context.getMapping(propertyComponents[0]) + 
          propertyComponents[1];
    } else {
      curieProperty =
          LinkedData.API.data.Context.getMapping(propertyComponents[0]) + 
          ':' + propertyComponents[1];    
      nonCurieProperty = property;
    }
    var xPathQuery =
        '//*[@property[contains(., \'' + nonCurieProperty + '\')]] | ' +
        '//*[@property[contains(., \'' + curieProperty + '\')]] | ' +
        '//*[@rel[contains(., \'' + nonCurieProperty + '\')]] | ' +
        '//*[@rel[contains(., \'' + curieProperty + '\')]] | ' +
        '//*[@rev[contains(., \'' + nonCurieProperty + '\')]] | ' +
        '//*[@rev[contains(., \'' + curieProperty + '\')]]';              
    var rootNode = (opt_rootNode? opt_rootNode : document);    
    var xPathResult = document.evaluate(
        xPathQuery,
        rootNode,
        null,
        XPathResult.ANY_TYPE,
        null);  
    var nodes = [];  
    var node;  
    while (node = xPathResult.iterateNext()) {
      if (!LinkedData.API.utility.isObjectElsewhere_(node, rootNode)) {      
        nodes.push(node);
      }
    }
    if (!opt_value) {
      return nodes;
    }
    var xPathQuery = '//@content | //@href | //@resource';        
    var resultNodes = [];      
    for (var i = 0, length = nodes.length; i < length; i++) {    
      var rootNode = nodes[i];
      var xPathResult = document.evaluate(
          xPathQuery,
          rootNode,
          null,
          XPathResult.ANY_TYPE,
          null);  
      var node;  
      var useTextNode = true;
      while (node = xPathResult.iterateNext()) {
        useTextNode = false;
        if (node.nodeValue === opt_value) {
          resultNodes.push(rootNode);
        }
      }
      if (useTextNode) {
        if (rootNode.nodeValue === opt_value) {
          resultNodes.push(rootNode);
        }
      }          
    }    
    return resultNodes;
  }

  /**
   * Retrieves a list of PropertyGroups by their type, such as foaf:Person.
   */   
  LinkedData.API.getItemsByType = function(type, opt_mappings) {
    var items = LinkedData.API.getElementsByType(type); 
    return LinkedData.API.utility.createPropertyGroups_(items, opt_mappings);
  }

  /**
   * Retrieves a single PropertyGroup by its subject, such as
   * http://example.org/people#bob.
   */   
  LinkedData.API.getItemsBySubject = function(
      subject,
      opt_mappings,
      opt_rootNode) {
    var items = LinkedData.API.getElementsBySubject(subject, opt_rootNode);
    return LinkedData.API.utility.createPropertyGroups_(items, opt_mappings);      
  }

  /**
   * Retrieves a list of PropertyGroups by a particular property and optional
   * value that the PropertyGroup contains.
   */   
  LinkedData.API.getItemsByProperty = function(
      property,
      opt_value,
      opt_mappings) {
    var items = LinkedData.API.getElementsByProperty(property, opt_value);
    return LinkedData.API.utility.createPropertyGroups_(items, opt_mappings);     
  }
    
  /**
   * Sets short-hand IRI mappings that are used by the API, such as
   * expanding foaf:Person to http://xmlns.com/foaf/0.1/Person.
   */
  LinkedData.API.data.Context.setMapping = function(prefix, iri) {
    if ((!LinkedData.API.utility.endsWith_(iri, '/')) &&
        (!LinkedData.API.utility.endsWith_(iri, '#'))) {
      iri += '/';
    }
    var colonIndex = prefix.indexOf(':');
    if (colonIndex > 0) {
      prefix = prefix.substring(0, colonIndex);    
    }
    LinkedData.API.data.Context._mappings[prefix] = iri;
    LinkedData.API.data.Context._mappings[iri] = prefix;
  }

  /**
   * Gets the full IRI for short-hand IRI mappings that are used by the API,
   * such as expanding foaf:Person to http://xmlns.com/foaf/0.1/Person.
   */
  LinkedData.API.data.Context.getMapping = function(prefix) {
    return (LinkedData.API.data.Context._mappings[prefix]?
        LinkedData.API.data.Context._mappings[prefix] :
        null);
  }

  /**
   * Retrieves an array of PropertyGroups based on a set of selection criteria.
   */
  LinkedData.API.data.Query.select = function(query, template) {
    // ToDo
  }

  /**
   * Data store interface
   */
  LinkedData.API.data.Store = function() {
    this.triples_ = [];
    this.length = 0;
  }   
  /**
   * Clears the current data store.
   */
  LinkedData.API.data.Store.prototype.clear = function() {
    this.triples_ = [];
    this.length = 0;
  }  
  /**
   * Filters a given DataStore by matching a given triple pattern.
   */
  LinkedData.API.data.Store.prototype.filter = function(pattern) {
    // ToDo
  }
  /**
   * Merges all triples in an external data store into this data store.
   * Duplicate triples must not be inserted into the same data store. Returns
   * true if all triples were merged into the store successfully.
   */
  LinkedData.API.data.Store.prototype.merge = function(store) {
    for(var i = 0, length = store.length; i < length; i++) {
      var newTriple = store.get(i);
      if (!this.contains(newTriple)) {
        this.add(newTriple);
      }
    }
    return true;
  }
  /**
   * 
   */
  LinkedData.API.data.Store.prototype.forEach = function(iterator) {
    // ToDo
  }  
  /**
   * Checks if a triple is contained in the current data store
   */
  LinkedData.API.data.Store.prototype.contains = function(triple) {
    for(var i = 0, length = this.length; i < length; i++) {     
      var currentTriple = this.get(i);      
      if ((triple.subject.toString() === currentTriple.subject.toString()) &&
          (triple.property.toString() === currentTriple.property.toString()) &&
          (triple.object.toString() === currentTriple.object.toString())) {
        return true;
      }
    }
    return false;     
  }
  /**
   * Creates a plain literal.
   */
  LinkedData.API.data.Store.prototype.createPlainLiteral = function(
      value,
      language) {
    return new LinkedData.API.PlainLiteral(value, language);
  }
  /**
   * Creates a typed literal.
   */
  LinkedData.API.data.Store.prototype.createTypedLiteral = function(
      value,
      type) {
    return new LinkedData.API.TypedLiteral(value, type);
  }
  /**
   * Creates a blank node.
   */
  LinkedData.API.data.Store.prototype.createBlankNode = function() {
    return new LinkedData.API.BlankNode();
  }
  /**
   * Creates an RDF triple.
   */
  LinkedData.API.data.Store.prototype.createTriple = function(
      subject,
      property,
      object) {
    return new LinkedData.API.RDFTriple(subject, property, object);
  }
  /**
   * Creates an IRI.
   */
  LinkedData.API.data.Store.prototype.createIRI = function(iri, opt_value) {
    return new LinkedData.API.IRI(iri, opt_value);
  }
  /**
   * Adds an RDF triple to the data store
   */
  LinkedData.API.data.Store.prototype.add = function(triple) {
    if (!this.contains(triple)) {
      this.triples_.push(triple);
      this.length++;      
    }        
  }
  /**
   * Gets the RDF triple with the specified index
   */
  LinkedData.API.data.Store.prototype.get = function(index) {
    return this.triples_[index];
  } 

  /**
   * Data parser interface
   */
  LinkedData.API.data.Parser = function(store) {
    this.store = store;
  }
  /**
   * Parses a document starting from the given node
   */
  LinkedData.API.data.Parser.prototype.parse = function(opt_node) {    
    var rootNode;
    if (!opt_node) {
      rootNode = document;
    } else {
      root = opt_node;
    }
    // inspired by and adapted from
    // http://www.jslab.dk/articles/non.recursive.preorder.traversal.part3
    var n = rootNode;    
    while(n) {
      if (n.nodeName === 'BODY') {
        if (!n.hasAttribute('about')) {
          n.setAttribute('about', document.location.href);
        }
      }
      if (n.v) {
        n.v = false;
        if (n == rootNode) {
          break;
        }
        if (n.nextSibling) {
          n = n.nextSibling;
        } else {
          n = n.parentNode;
        }
      } else {
        var rdfTriples = LinkedData.API.utility.checkNodeForTriples_(n);
        if (rdfTriples) {
          for (var i = 0, length = rdfTriples.length; i < length; i++) {
            var rdfTriple = rdfTriples[i];
            this.store.add(rdfTriple);
          }
        }
        if (n.firstChild) {
          n.v = true;
          n = n.firstChild;
        } else if (n.nextSibling) {
          n = n.nextSibling;
        } else {
          n = n.parentNode;
        }
      }
    }
  } 

  /**
   * Iterates through a DOM, using a low-memory, stream-based approach, matching
   * on the given triple pattern.
   */
  LinkedData.API.data.Parser.prototype.iterate = function(pattern) {
    // ToDo
  }
  
  /**
   * The PropertyGroup interface provides a view on a particular subject
   * contained in the DataStore. The PropertyGroup aggregates the RDFTriples as
   * a single language-native object in order to provide a more natural
   * programming primitive for developers.
   */
   LinkedData.API.PropertyGroup = function(source, properties, opt_mappings) {
     this.info = {};
     this.info.source = source;
     this.properties = properties;  
     if (opt_mappings) {
       for (var key in opt_mappings) {
         this[opt_mappings[key]] = this.get(key);
       }      
     }    
   }     
  LinkedData.API.PropertyGroup.prototype.get = function(property) {
    if (LinkedData.API.utility.contains_(this.properties, property)) {
      var items = LinkedData.API.getElementsByProperty(
          property,
          null,
          this.info.source);                
      var results = [];    
      for (var i = 0, length1 = items.length; i < length1 ; i++) {
        var xPathQuery = './@content | ./@href | ./@resource';                
        var xPathResult = document.evaluate(
            xPathQuery,
            items[i],
            null,
            XPathResult.ANY_TYPE,
            null);  
        var node;  
        var useTextNode = true;
        while (node = xPathResult.iterateNext()) {
          useTextNode = false;
          results.push(node.nodeValue);
        }
        if (useTextNode) {          
          /*
          if ((this.info.source.firstChild) &&
              (this.info.source.firstChild.nodeValue) &&
              (this.info.source.childNodes.length === 1) &&
              (this.info.source.firstChild.nodeValue.trim())) {            
            var prettyValue = this.info.source.firstChild.nodeValue.replace(
                /\n/g, ' ').trim();              
          */    
          if ((items[i].hasAttribute('datatype')) &&
              (items[i].getAttribute('datatype') === '')) {            
            var prettyValue = items[i].innerText.replace(
                /\n/g, ' ').trim();                
            results.push(prettyValue);
          } else if ((items[i].firstChild) &&
                     (items[i].firstChild.nodeValue) &&
                     (items[i].childNodes.length === 1) &&
                     (items[i].firstChild.nodeValue.trim())) {            
            var prettyValue = items[i].firstChild.nodeValue.replace(
                /\n/g, ' ').trim();                
            results.push(prettyValue);
          } else {
            var children = items[i].childNodes;
            var blankNodeRoot;
            var elementNodes = 0;
            for (var j = 0, length2 = children.length; j < length2; j++) {
              if (children[j].nodeType === 1) {
                elementNodes++;
              }
              if (elementNodes > 1) {                
                break;
              }
            }
            if (elementNodes > 1) {
              blankNodeRoot = items[i];
            }          
            if (blankNodeRoot) {
              if (!blankNodeRoot.hasAttribute('about')) {
                var blankNode = new LinkedData.API.BlankNode();                 
                blankNodeRoot.setAttribute('about', blankNode.toString());
                results.push(blankNode.toString());              
              } else {
                if (!blankNodeRoot.getAttribute('about').indexOf('_:') === 0) {
                  results.push(blankNodeRoot.getAttribute('about'));              
                }
              }              
            } else {
              if ((items[i].hasAttribute('datatype')) &&
                  (items[i].getAttribute('datatype') === '')) {
                var prettyValue = items[i].innerText.trim();                  
                results.push(prettyValue);                    
              } else {
                for (var j = 0, length2 = children.length; j < length2; j++) {
                  if (children[j].nodeType === 3) {
                    if (length2 === 1) {
                      results.push(children[j].nodeValue.trim());                    
                      break;
                    } else {
                      continue;
                    }
                  } else if ((children[j].nodeType === 1) &&
                      (children[j].hasAttribute('href'))) {
                    var prettyValue = children[j].getAttribute('href');
                    if (prettyValue === '/') {
                      prettyValue = document.location.href;
                    }
                    results.push(prettyValue);                    
                    break;
                  } else if ((children[j].childNodes) &&
                             (children[j].childNodes.length === 1) &&
                             (children[j].firstChild.nodeType === 1)) {
                    if (children[j].firstChild.hasAttribute('href')) {
                      var prettyValue =
                          children[j].firstChild.getAttribute('href').trim();
                      if (prettyValue === '/') {
                        prettyValue = document.location.href;
                      }
                      results.push(prettyValue);                    
                      break;                                          
                    } else {
                      results.push(items[i].innerText.trim());                    
                      break;                      
                    } 
                  } else if (items[i].innerText.trim()) {                  
                    results.push(items[i].innerText.trim());                    
                    break;
                  }              
                }
              }              
            }            
          }
        }
      }                 
      return results;    
    } else {
      return false;
    }
  }
  
  /**
   * Typed literal interface
   */
  LinkedData.API.TypedLiteral = function(value, type) {
    this.value = value;
    this.type = type;
  }
  LinkedData.API.TypedLiteral.prototype.toString = function() {
    return this.value;
  }
  /**
   * Returns a native language representation of this literal. The type
   * conversion should be performed by translating the value of the literal
   * using the IRI reference of the datatype to the closest native datatype in
   * the programming language.
   *
   * ToDo
   *
   */
  LinkedData.API.TypedLiteral.prototype.valueOf = function() {
    return this.value;
  }  
  
  /**
   * Plain literal interface
   */
  LinkedData.API.PlainLiteral = function(value, language) {
    this.value = value;
    this.language = language;
  }
  LinkedData.API.PlainLiteral.prototype.toString = function() {
    return this.value;
  }
  
  /**
   * Blank node interface
   */
  LinkedData.API.BlankNode = function() {
    this.value = LinkedData.API.utility.getUniqueId_();
  } 
  LinkedData.API.BlankNode.prototype.toString = function() {
    return '_:' + this.value;
  }
  
  /**
   * RDF triple interface
   */
  LinkedData.API.RDFTriple = function(subject, property, object) {
    this.subject = subject;
    this.property = property;
    if (object.indexOf('http') === 0) {
      object = new LinkedData.API.IRI(object);
    } else if ((object.match(/\w\:\w/g)) &&
               (!object.match(/_\:\w/g))) {
      object = new LinkedData.API.IRI(object);
    }        
    this.object = object;    
    this.size = 3; // fixed size
  }
  LinkedData.API.RDFTriple.prototype.get = function(index) {
    switch(index) {
      case 0:
        return this.subject;
        break;
      case 1:
        return this.property;
        break;
      case 2:
        return this.object;
        break;
    }
  }
  LinkedData.API.RDFTriple.prototype.toString = function() {
    return (
        this.getSubject() + ' ' +
        this.getProperty() + ' ' +
        this.getObject() + ' .'); 
  }
  LinkedData.API.RDFTriple.prototype.getSubject = function() {
    var subject;
    if (this.subject.toString().indexOf('_:') === 0) {
      subject = this.subject + ' ';      
    } else if (this.subject.toString().indexOf('#') === 0) {
      subject = '&lt;' + document.location.href + this.subject + '&gt; ';
    } else {
      subject = '&lt;' + this.subject + '&gt;';            
    }
    return subject; 
  }
  LinkedData.API.RDFTriple.prototype.getProperty = function() {
    if ((this.property.indexOf(':') === false) ||
        (this.property.indexOf('http') === 0)) {
      return '&lt;' + this.property + '&gt;'; 
    } else {
      return this.property;       
    }
  }
  LinkedData.API.RDFTriple.prototype.getObject = function() {
    var object;
    if (typeof this.object === 'object') {
      object = '&lt;' + this.object + '&gt;';
    } else if ((typeof this.object === 'string') &&
               (this.object.indexOf('_:') === 0)) {
      object = this.object;           
    } else {
      object = '"' + this.object + '"';
    }
    return object; 
  }
  
  /**
   * IRI interface
   */
  LinkedData.API.IRI = function(iri, opt_node) {
    this.iri = iri;
    if (opt_node) {
      this.node = opt_node;
    }
  } 
  LinkedData.API.IRI.prototype.toString = function() {
    return this.iri;
  }
  
-->