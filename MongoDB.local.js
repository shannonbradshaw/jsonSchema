ex0 = function() {
  return db.getCollectionInfos({name:"orders"});
};

ex1 = function() {
  return db.createCollection("orders", {
    validator: {
      item: { $type: "string" },
      price: { $type: "decimal" },
      quantity: { $type: "int" },
      color: { $in: ["red", "green", "blue"] }
    }
  });
};

ex2 = function() {
  return db.orders.insertOne({
    _id: 77345, 
    item: "Fleece Gloves", 
    price: "15.5",
    quantity: NumberInt("1"),
    color: "red"
  });
};

ex3 = function() {
  return db.orders.insertOne({
    _id: 77346, 
    item: "Fleece Gloves", 
    price: NumberDecimal("15.5"),
    quantity: NumberInt("1"),
    color: "red"
  });
};

ex4 = function() {
  return db.orders.updateOne(
    {_id: 77346},  	
    {$set: {"colour": "green"}}
  );
};

ex5 = function() {
  return db.runCommand({
    collMod: "orders",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        properties: {
          _id: {},
          item: {
            bsonType: "string"
          },
          price: {
            bsonType: "decimal"
          },
          color: {
            bsonType: "string"
          },
          quantity: {
            bsonType: ["int", "long"]
          }
        },
        required: ["item", "price", "quantity"],
      }
    }
  });  
};


ex6 = function() {
  return db.runCommand({
    collMod: "orders",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        properties: {
          _id: {},
          item: {
            bsonType: "string"
          },
          price: {
            bsonType: "decimal"
          },
          color: {
            bsonType: "string"
          },
          quantity: {
            bsonType: ["int", "long"]
          }
        },
        required: ["item", "price", "quantity"],
        additionalProperties: false,
      }
    }
  });  
};


ex7 = function() {
  return db.runCommand({
    collMod: "orders",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        properties: {
          _id: {},
          item: {
            bsonType: "string"
          },
          price: {
            bsonType: "decimal"
          },
          color: {
            bsonType: "string"
          },
          quantity: {
            bsonType: ["int", "long"],
            minimum: 1,
            maximum: 100,
            exclusiveMaximum: true,
            description: "int or long integer in [0, 100)"
          }
        },
        required: ["item", "price", "quantity"],
        additionalProperties: false,
      }
    }
  });  
};


ex8a = function() {
  return db.orders.insertMany([
    { 
      item: "Argyle Socks", 
      price: NumberDecimal(15.50),
      quantity: NumberInt(100)
    },
    {
      item: "Flannel T-shirt", 
      price: NumberDecimal(27.99),
      quantity: "2"
    },
    {
      item: "Wool Stocking Cap", 
      price: NumberDecimal(17.33),
      quantity: NumberLong(1),
      colour: "heather gray"
    }
  ],
  {
    "ordered": false 
  });
};

ex8b = function() {
  return db.orders.insertMany([
    { 
      item: "Argyle Socks", 
      price: NumberDecimal(15.50),
      quantity: NumberInt(99)
    },
    {
      item: "Flannel T-shirt", 
      price: NumberDecimal(27.99),
      quantity: NumberInt("2")
    },
    {
      item: "Wool Stocking Cap", 
      price: NumberDecimal(17.33),
      quantity: NumberLong(1),
      color: "heather gray"
    }
  ],
  {
    "ordered": false 
  });
};

ex9 = function() {
  return db.runCommand({
    collMod: "orders",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        properties: {
          lineitems: {
            bsonType: ["array"],
            minItems: 1,
            maxItems:10,
            items: {
              bsonType: "object",
              properties: {
                sku: {
                  bsonType: "string"
                },
                name: {
                  bsonType: "string"
                },
                unit_price: {
                  bsonType: "decimal"
                },
                quantity: {
                  bsonType: ["int", "long"],
                  minimum: 0,
                  maximum: 100,
                  exclusiveMaximum: true,
                  description: "int or long integer in [0, 100)"
                }
              },
              required: ["unit_price", "sku", "quantity"],
              additionalProperties: false
            }
          }
        },
        required: ["lineitems"] } } }); }; 


ex10a = function() {
  return db.orders.insert({
    total: NumberDecimal(1005),
    VAT: NumberDecimal(0.20),
    totalWithVAT: NumberDecimal(1020),
    lineitems: [
      {
        name: "Chloe Kim Signature Snowboard",
        quantity: NumberInt(2),
        unit_price: NumberDecimal(400)
      },
      {
        sku: "MDBTS002",
        quantity: NumberInt(4),
        price: NumberDecimal(50)
      } ] } ) };


ex10b = function() {
  return db.orders.insert({
    total: NumberDecimal(1005),
    VAT: NumberDecimal(0.20),
    totalWithVAT: NumberDecimal(1020),
    lineitems: [
      {
        sku: "MDBTS001",
        name: "Chloe Kim Signature Snowboard",
        quantity: NumberInt(2),
        unit_price: NumberDecimal(400)
      },
      {
        sku: "MDBTS002",
        quantity: NumberInt(4),
        unit_price: NumberDecimal(50)
      } ] } ) };


ex11 = function() {
  return db.runCommand({
    collMod: "orders",
    validator: {
      $expr:{ $and:[
        {$eq:[ 
          "$totalWithVAT",
          {$multiply:["$total", {$sum:[1,"$VAT"]}]}
        ]}, 
        {$eq: [
          "$total", 
          {$sum: {$map: {
            "input": "$lineitems",
            "as": "item",
            "in":{"$multiply":["$$item.quantity","$$item.unit_price"]}
          }}}
        ]}
      ]},
      $jsonSchema: {
        bsonType: "object",       
        required: ["lineitems", "total", "VAT", "totalWithVAT"],
        properties: {
          total: { bsonType: "decimal" },
          VAT: { bsonType: "decimal" },
          totalWithVAT: { bsonType: "decimal" },
          lineitems: {
            bsonType: ["array"],
            minItems: 1,
            maxItems:10,
            items: {
              required: ["unit_price", "sku", "quantity"],
              bsonType: "object",
              additionalProperties: false,
              properties: {
                sku: {bsonType: "string"},
                name: {bsonType: "string"},
                unit_price: {bsonType: "decimal"},
                quantity: {
                  bsonType: ["int", "long"],
                  minimum: 0,
                  maximum: 100,
                  exclusiveMaximum: true
                } } } } } } } }); };


ex12a = function() {
  return db.orders.insert({
    total: NumberDecimal(1005),
    VAT: NumberDecimal(0.20),
    totalWithVAT: NumberDecimal(1020),
    lineitems: [
      {
        sku: "MDBTS001",
        name: "Chloe Kim Signature Snowboard",
        quantity: NumberInt(2),
        unit_price: NumberDecimal(400)
      },
      {
        sku: "MDBTS002",
        quantity: NumberInt(4),
        unit_price: NumberDecimal(50)
      } ] } ) };

ex12b = function() {
  return db.orders.insert({
    total: NumberDecimal(1000),
    VAT: NumberDecimal(0.20),
    totalWithVAT: NumberDecimal(1020),
    lineitems: [
      {
        sku: "MDBTS001",
        name: "Chloe Kim Signature Snowboard",
        quantity: NumberInt(2),
        unit_price: NumberDecimal(400)
      },
      {
        sku: "MDBTS002",
        quantity: NumberInt(4),
        unit_price: NumberDecimal(50)
      } ] } ) };

ex12c = function() {
  return db.orders.insert({
    total: NumberDecimal(1000),
    VAT: NumberDecimal(0.20),
    totalWithVAT: NumberDecimal(1200),
    lineitems: [
      {
        sku: "MDBTS001",
        name: "Chloe Kim Signature Snowboard",
        quantity: NumberInt(2),
        unit_price: NumberDecimal(400)
      },
      {
        sku: "MDBTS002",
        quantity: NumberInt(4),
        unit_price: NumberDecimal(50)
      } ] } ) };

