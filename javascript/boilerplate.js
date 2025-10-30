
/*//Code to reset or delete the database.
localforage.dropInstance({
    name: "localforage",
    storeName: "keyvaluepairs"
  }).then(function() {
    console.log("Database cleared!");
  }).catch(function(err) {
    console.log("Error clearing database:", err);
  });*/



// Boilerplate: initialize the db
class DB {
  db = null;
  config = {
    locateFile: (filename) =>
      "https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/sql-wasm.wasm",
  };
  constructor(createQuery) {
    this.#getLocalStorageData(createQuery);
  }

  #getLocalStorageData(createQuery) {
    initSqlJs(this.config).then((SQL) => {
      localforage
        .getItem("db")
        .then((value) => {
          this.#initDB(value, SQL, createQuery);
          queryData("Open");
        })
        .catch(function (err) {
          console.log("Error: " + err);
        });
    });
  }

  #initDB(value, SQL, createQuery) {
    if (value) {
      // if db exists, load it
      this.db = new SQL.Database(value);
    } else {
      // if db doesn't exist, create it
      console.log("Creating db");
      this.db = new SQL.Database();
      // Run a query without reading the results
      this.db.run(createQuery);
    }
  }

  #storeIndexDB() {
    localforage.setItem("db", this.db.export()).catch(function (err) {
      if (err) console.log(err);
    });
  }
  //Function to insert the data into the database.
  insert(insertQuery, values) {
    this.db.run(insertQuery, values);
    this.#storeIndexDB();
  }

  //Function to update the data in the database.
  update(updateQuery, values) {
    this.db.run(updateQuery, values);
    this.#storeIndexDB();
  }

  //Function to delete the data from the database.
  delete(deleteQuery, values) {
    this.db.run(deleteQuery, values);
    this.#storeIndexDB();
  }

  //Function to select the data from the database.
  select(selectQuery, values) {
    return this.db.exec(selectQuery, values);
  }

  //Function to select all the data from the database.
  selectAll(selectQuery) {
    return this.db.exec(selectQuery);
  }

  UpdateRow(query, id) {
    this.db.run(query, [id]);
    this.#storeIndexDB();
  }
}


