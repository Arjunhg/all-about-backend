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

# PROJECTION & EMBEDDED DOCUMENTS
- Find all comments where the comments array contains a user named "user1".
    ```
    db.comments.find({
      "comments.user": "user1"
    })
    ```
- Find comments where a comment exists with the user "user5" and the text contains "aggregations".
    ```
    db.comments.find({
      comments: {
        $elemMatch: {user: "user5", text: "aggregation"}
      }
    })

    or...

    db.comments.find({
      comments: {
        $elemMatch: {user: "user5", text: /aggregation/i}
      }
    })
    ```
- Find comments where the metadata.likes field contains at least 85 and 90.
    ```
    db.comments.find({
      "metadata.likes" : {$all: [85, 40]}
    })
    ```
- Find comments with metadata.likes greater than or equal to 100.
    ```
    db.comments.find({
      "metadata.likes": {$gte: 100}
    })

    ```
- Return only the article title and the user fields of comments.
    ```
    db.comments.find({}, {title: 1, "comments.user":1, _id: 0})
    ```
- Find comments where comments include both "user7" and "user8".
    ```
    db.comments.find({
      comments: {
        $elemMatch: {"comments.user": "user7", "comments.user": "user8"}
      }
    })

    or...

    db.comments.find({
      "comments.user": {$all: ["user7", "user8"]}
    })

    - First one is not possible as: {"comments.user": "user7", "comments.user": "user8"} inside $elemMatch is not possible, because a single object in the array cannot have both "user": "user7" and "user": "user8" at the same time.

    - Ex:
        {
          "_id": 1,
          "comments": [
            { "user": "user7", "text": "Hello" },
            { "user": "user8", "text": "Hi" }
          ]
        }

    ```
- Count comments where metadata.views is greater than 2000.
    ```
    db.comments.find({
      "metadata.view": {$gt: 2000}
    }).count()

    or...

    db.comments.count({
      "metadata.view": {$gt: 2000}
    })

    - db.comments.count({...}) is optimized to return just the count of matching documents without retrieving them.

    - db.comments.find({...}).count() first retrieves the documents (though not fully) and then counts them, which can be slightly less efficient.

    - In MongoDB 4.0+, count({...}) is deprecated in favor of estimatedDocumentCount() or countDocuments({...}), but for simple queries, it still works.
    ```
- Find comments authored by "Sarah Adams" that also have at least one comment from "user17".
    ```
    db.comments.find({
      author: "Sarah Adams",
      "comments.user": "user17"
    })
    ```
- Fetch only the title and metadata.views for comments with more than 3000 views.
    ```
    db.comments.find(
      {"metadata.views": {$gt: 3000},
      {title: 1, "metadata.views": 1, _id: 0}
    )

    ```
- Find comments where the content mentions "React".
    ```
    db.comments.find({
      content: {$regex: "React", $options: "i"}
    })
    ```