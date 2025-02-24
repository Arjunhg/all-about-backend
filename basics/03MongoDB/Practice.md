- Find documents where the discount field exists, is of type double, and its value is less than the price.
  - ``` 
      db.inventory.find({
        discount: {$exists: true, $type: "double"},
        $expr: {$lt: ["$discount", "$price"]}
      })
      ```
- Find documents where the rating field does not exist.
  - ``` 
      db.inventory.find({
        rating: {$exists:  false}
      })
      ```
- Find documents where the price field is greater than half the value of the stock field.
  - ``` 
     db.inventory.find({
        $expr: {$gt: ["$price", {$divide: ["$stock", 2]}]}
     })
      ```
- Find documents where the stock field is either a double or an int.
  - ``` 
     db.inventory.find({
        stock: {$type: ["double", "int"]}
     })

     or...

     db.inventory.find({
        $or: [
            {stock: {$type: "double"}},
            {stock: {$type: "int"}}
          ]
      })
      ```
- Find documents where the description field exists.
  - ``` 
      db.inventory.find({
        description: {$exists: true}
      })
      ```
- Find documents where the stock minus price is greater than 50.
  - ``` 
      db.inventory.find({
        $expr: {$gt: [{$subtract: ["$stock", "$price"]}, 50]}
      })
      ```
- Find documents where the price field is of type double.
  - ``` 
      db.inventory.find({
        price: {$type: "double"}
      })
      ```
- Find documents where the stock field is at least double the value of the price field.
  - ``` 
      db.inventory.find({
        $expr: {$gte: ["$stock", {$multiply: ["$price", 2]}]}
      })
      ```
- Find documents where stock is exactly 3 times the price.
  - ``` 
      db.inventory.find({
        $expr: {$eq: ["$stock", {$multiply: ["$price", 3]}]}
      })
      ```