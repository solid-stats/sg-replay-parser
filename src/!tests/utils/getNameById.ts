const getNameById = (id: EntityId, prefix?: PlayerPrefix) => `${prefix ? `[${prefix}]` : ''}some_name_${id + 1}`;

export default getNameById;
