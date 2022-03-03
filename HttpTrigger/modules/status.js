exports.create = function (verb) {
  switch(verb){
    case "POST": 
      return { text: "created", color: "19a5a2" };
    case "PUT": 
      return { text: "created/updated", color: "ffc107" };
    case "PATCH": 
      return { text: "updated", color: "ffc107" };
    case "DELETE": 
      return { text: "deleted", color: "dc3545" };
  }
}