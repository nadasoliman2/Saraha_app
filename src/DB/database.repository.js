export const findOne = async ({ model, select = '', options = {}, filter = {} } = {}) => {
  let query = model.findOne(filter).select(select)

  if (options.populate) query = query.populate(options.populate)
  if (options.lean) query = query.lean()

  return await query.exec()
}

export const create = async({model,
    data={},
options = {  validateBeforeSave: true}}={})=>{
return await model.create(data,options)
}
export const createOne = async ({ model, data = {}, options = { validateBeforeSave: true } } = {}) => {
  return await model.create(data, options)
}

