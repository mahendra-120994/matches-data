function snakeToCamel(object) {
  const keysList = Object.keys(object);

  const newObj = {};
  keysList.map((eachKey) => {
    const key = eachKey.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) =>
      chr.toUpperCase()
    );
    newObj[key] = object[eachKey];
  });
  return newObj;
}

module.exports = snakeToCamel;