var idbApp = (function() {
    'use strict';
  
    if (!('indexedDB' in window)) {
        console.log('IDB:0');
        return;
    }
  
    var dbPromise = idb.open('testInstitute2001', 3, function(upgradeDb) {
      switch (upgradeDb.oldVersion) {
        case 0:
          // a placeholder case so that the switch block will 
          // execute when the database is first created
          // (oldVersion is 0)
        case 1:
          console.log('Creating the monday object store');
          upgradeDb.createObjectStore('batches', {keyPath: 'day',autoIncrement: true});
        case 2:
          console.log('Creating a day index');
          var store = upgradeDb.transaction.objectStore('batches');
          store.createIndex('day', 'day', {unique: true});
      
    
        // TODO 4.2 - create 'price' and 'description' indexes
    
        // TODO 5.1 - create an 'orders' object store
    
      }
    });
    function addProducts() {
      dbPromise.then(async function(db) {
      var tx = db.transaction('batches', 'readwrite');
      var store = tx.objectStore('batches');
    var items = [{
      mon: [  //day
        { //period
          8:{ //class
              A:{ //section
                assignee:'teacher@testing.com',
                hold:true,
                subject:'Physics'
              },
              B:{
                assignee:'some@testing.com',
                hold:true,
                subject:'English'
              }
          },
          9:{
            A:{
              assignee:'2teacher@testing.com',
              hold:true,
              subject:'Chem'
            },
            B:{
              assignee:'s3ome@testing.com',
              hold:true,
              subject:'Hindi'
            }
          }
        }
      ],

    },
    {
      tue: [  //day
        { //period
          8:{ //class
              A:{ //section
                assignee:'teacher@testing.com',
                hold:true,
                subject:'Physics'
              },
              B:{
                assignee:'some@testing.com',
                hold:true,
                subject:'English'
              }
          },
          9:{
            A:{
              assignee:'2teacher@testing.com',
              hold:true,
              subject:'Chem'
            },
            B:{
              assignee:'s3ome@testing.com',
              hold:true,
              subject:'Hindi'
            }
          }
        }
      ],

    }];

  return Promise.all(items.map(function(item) {
      console.log('Adding item: ', item);
      return store.add(item);
    })
  ).catch(function(e) {
    snackBar(true,'Error: Check console.',false,nothing,false);
    tx.abort();
    console.log(e);
  }).then(function() {
    snackBar(true,'Success: Check indexedDB.');
    console.log('All items added');
  });
});
  
    }
  
    function getByName(key) {
      return dbPromise.then(function(db) {
        var tx = db.transaction('products', 'readonly');
        var store = tx.objectStore('products');
        var index = store.index('name');
        return index.get(key);
      });
    }

    function displayByName() {
      var key = document.getElementById('name').value;
      if (key === '') {return;}
      var s = '';
      getByName(key).then(function(object) {
        if (!object) {return;}
  
        s += '<h2>' + object.name + '</h2><p>';
        for (var field in object) {
          s += field + ' = ' + object[field] + '<br/>';
        }
        s += '</p>';
  
      }).then(function() {
        if (s === '') {s = '<p>No results.</p>';}
        document.getElementById('results').innerHTML = s;
      });
    }
  
    function getByPrice() {
  
      // TODO 4.4a - use a cursor to get objects by price
  
    }
  
    function getByDesc() {
      var key = document.getElementById('desc').value;
      if (key === '') {return;}
      var range = IDBKeyRange.only(key);
      var s = '';
      dbPromise.then(function(db) {
  
        // TODO 4.4b - get items by their description
  
      }).then(function() {
        if (s === '') {s = '<p>No results.</p>';}
        document.getElementById('results').innerHTML = s;
      });
    }
  
    function addOrders() {
  
      // TODO 5.2 - add items to the 'orders' object store
  
    }
  
    function showOrders() {
      var s = '';
      dbPromise.then(function(db) {
  
        // TODO 5.3 - use a cursor to display the orders on the page
  
      }).then(function() {
        if (s === '') {s = '<p>No results.</p>';}
        document.getElementById('orders').innerHTML = s;
      });
    }
  
    function getOrders() {
  
      // TODO 5.4 - get all objects from 'orders' object store
  
    }
  
    function fulfillOrders() {
      getOrders().then(function(orders) {
        return processOrders(orders);
      }).then(function(updatedProducts) {
        updateProductsStore(updatedProducts);
      });
    }
  
    function processOrders(orders) {
  
      return dbPromise.then(function(db) {
  var tx = db.transaction('products');
  var store = tx.objectStore('products');
  return Promise.all(
    orders.map(function(order) {
      return store.get(order.id).then(function(product) {
        return decrementQuantity(product, order);
      });
    })
  );
});
  
    }
  
    function decrementQuantity(product, order) {
  
      return new Promise(function(resolve, reject) {
        var item = product;
        var qtyRemaining = item.quantity - order.quantity;
        if (qtyRemaining < 0) {
          console.log('Not enough ' + product.id + ' left in stock!');
          document.getElementById('receipt').innerHTML =
          '<h3>Not enough ' + product.id + ' left in stock!</h3>';
          throw 'Out of stock!';
        }
        item.quantity = qtyRemaining;
        resolve(item);
      });
  
    }
  
    function updateProductsStore(products) {
      dbPromise.then(function(db) {
  
        // TODO 5.7 - update the items in the 'products' object store
  
      }).then(function() {
        console.log('Orders processed successfully!');
        document.getElementById('receipt').innerHTML =
        '<h3>Order processed successfully!</h3>';
      });
    }
  
    return {
      dbPromise: (dbPromise),
      addProducts: (addProducts),
      getByName: (getByName),
      displayByName: (displayByName),
      getByPrice: (getByPrice),
      getByDesc: (getByDesc),
      addOrders: (addOrders),
      showOrders: (showOrders),
      getOrders: (getOrders),
      fulfillOrders: (fulfillOrders),
      processOrders: (processOrders),
      decrementQuantity: (decrementQuantity),
      updateProductsStore: (updateProductsStore)
    };
  })();
