// Globals
let activeBrand = ''

// Filters

const filterDistance = (array, option) => {
  // console.log('filterDistance ::', array, option)
  const postCode = localStorage.getItem('postCode')
  if (postCode && !isNaN(parseInt(option))) {
    return array.filter(item => {
      return item.roundedDistance <= parseInt(option)
    })
  }
  return array
}

const filterYear = (array, option) => {
  // console.log('filterYear ::', array, option)  
  return array.filter(item => item.product.year == option)
}

const filterPrice = (array, option) => {
  // console.log('filterPrice', array, option)
  return array.filter(item => (item.price / 100) <= option)
}

const filterCondition = (array, option) => {
  // console.log('filterCondition', array, option)
  return array.filter(item => (item.condition === 10 && option !== 'New'))
}

const filterMake = (array, option) => {
  // console.log('filterMake', array, option)
  if (activeBrand !== option) {
    populateModels(array, option)
  }
  if (option != 'Any') {
    return array.filter(item => (item.product.brand.name == option))
  } else {
    emptyModels()
    return array
  }
}

const filterModel = (array, option) => {
  // console.log('filterModel', array, option)
  return array.filter(item => (item.product.model.includes(option)))
}

const filterModelNumber = (array, option) => {
  // console.log('filterModelNumber', array, option)
  return array.filter(item => (item.product.slug.includes(option)))
}

const filterCaseMaterial = (array, option) => {
  // console.log('filterCaseMaterial', array, option)
  return array.filter(item => item.product.caseMaterial == option)
}

const filterStrapMaterial = (array, option) => {
  // console.log('filterStrapMaterial', array, option)
  return array.filter(item => item.product.strap == option)
}

const filterBox = (array, option) => {
  // console.log('filterBox', array, option)
  return array.filter(item => item.box == (option == 'Yes'))  
}

const filterPapers = (array, option) => {
  // console.log('filterPapers', array, option)
  return array.filter(item => item.papers == (option == 'Yes'))  
}

const filterConditionRating = (array, option) => {
  // console.log('filterConditionRating', array, option)
  return array.filter(item => item.condition >= option) 
}

const filterGemstones = (array, option) => {
  return array.filter(item => item.gemstones == (option == 'Yes'))
}

const filterServiced = (array, option) => {
  return array.filter(item => item.serviced == (option == 'Yes'))
}

const filterWarranty = (array, option) => {
  return array.filter(item => item.warranty == option)
}

const filterMovement = (array, option) => {
  return array.filter(item => item.product.movement == option)
}

const filterGender = (array, option) => {
  return array.filter(item => item.product.gender == option)
}

// Options initialisation

function getYears() {
  const years = []
  for (let i = Number(new Date().getFullYear()); i > 1900; i--) {
    years.push(i)
  }
  return years
}

function getPrices() {
  return [100, 150, 200, 250, 300, 350, 400, 500, 600, 700, 800, 900, 1000, 1500, 2000]
}

function getDistances() {
  return localStorage.getItem('postCode') ? [1,5,10,15,20,25,30,35,40,45,50,60,70,80,90,100, 200] : ['No post code provided']
}

// Makes / models helpers

function populateModels(products, brand) {
  activeBrand = brand
  const brandProducts = products.filter(item => item.product.brand.name == brand)
  const models = brandProducts.map(item => item.product.model)
  models.push('Any')
  const modelNumbers = brandProducts.map(item => item.product.slug)
  modelNumbers.push('Any')
  filters[2].options = models
  filters[2]['active'] = false
  filters[2]['value'] = filters[2].name
  filters[6].options = modelNumbers
  filters[6]['active'] = false
  filters[6]['value'] = filters[6].name
}

function emptyModels() {
  filters[2].options = []
  filters[2]['active'] = false
  filters[2]['value'] = filters[2].name
  filters[6].options = []
  filters[6]['active'] = false
  filters[6]['value'] = filters[6].name
}

// Filters array

let filters = [
  {name: 'Distance (Miles)', options: getDistances(), function: filterDistance, active: false, value: 'Distance (Miles)'},
  {name: 'Make',options: [], function: filterMake, active: false, value: 'Make'},
  {name: 'Model',options: [], function: filterModel, active: false, value: 'Model'},
  {name: 'Year', options: getYears(), function: filterYear, active: false, value: 'Year'},
  {name: 'Max Price (Pounds)', options: getPrices(), function: filterPrice, active: false, value: 'Max Price (Pounds)'},
  {name: 'Condition', options: ['New', 'Pre Owned'], function: filterCondition, active: false, value: 'Condition'},
  {name: 'Model Number',options: [], function: filterModelNumber, active: false, value: 'Model Number'},
  {name: 'Case Material',options: [], function: filterCaseMaterial, active: false, value: 'Case Material'},
  {name: 'Case Diameter',options: [], function: item => true, active: false, value: 'Case Diameter'},
  {name: 'Strap Material',options: [], function: filterStrapMaterial, active: false, value: 'Strap Material'},
  {name: 'Strap Colour',options: [], function: item => true, active: false, value: 'Strap Colour'},
  {name: 'Box',options: ['Yes', 'No'], function: filterBox, active: false, value: 'Box'},
  {name: 'Papers',options: ['Yes', 'No'], function: filterPapers, active: false, value: 'Papers'},
  {name: 'Condition Rating',options: [1,2,3,4,5,6,7,8,9,10], function: filterConditionRating, active: false, value: 'Condition Rating'},
  {name: 'Serviced',options: ['Yes', 'No'], function: filterServiced, active: false, value: 'Serviced'},
  {name: 'Warranty (Months)',options: [0, 12, 24, 48], function: filterWarranty, active: false, value: 'Warranty (Months)'},
  {name: 'Gemstones',options: ['Yes', 'No'], function: filterGemstones, active: false, value: 'Gemstones'},
  {name: 'Movement',options: ['manual'], function: filterMovement, active: false, value: 'Movement'},  
  {name: 'Gender',options: ['male', 'female'], function: filterGender, active: false, value: 'Gender'},  
]

const defaultFilters = filters

// Filters setup

let brands = []

function setupBrands(brandList) {
  // console.log('setupBrands ::', brandList)
  filters.forEach(filter => filter.options.push('Any'))
  brands = brandList
  const brandNames = brandList.map(brand => brand.name)
  brandNames.push('Any')
  filters[1].options = brandNames
  return filters
}

function setupProducts(productList) {
  // console.log('setupProducts ::', productList)
  const caseMaterials = ['Any']
  const caseDiameters = []
  const strapMaterials = ['Any']
  const strapColours = []
  productList.forEach(item => {
    if (!caseMaterials.includes(item.product.caseMaterial)) {
      caseMaterials.push(item.product.caseMaterial)
    }
    if (!caseDiameters.includes(item.product.caseDiameter)) {
      caseDiameters.push(item.product.caseDiameter)
    }
    if (!strapMaterials.includes(item.product.strap)) {
      strapMaterials.push(item.product.strap)
    }
    if (!strapColours.includes(item.product.strapColour)) {
      strapColours.push(item.product.strapColour)
    }
  })
  filters[7].options = caseMaterials
  filters[9].options = strapMaterials
  // console.log(caseMaterials, caseDiameters, strapMaterials, strapColours)
}

// Mail function applying all of the filters

function applyFilters(productsList) {
  let displayedList = productsList
  // console.log('applyFilters :: ', filters)
  filters.forEach(filter => {
    if (filter['active'] && filter['value'] !== filter['name'] && filter['value'] !== 'Any') {
      displayedList = filter.function(displayedList, filter['value'])
    }
  })
  return displayedList
}

function resetFilters() {
  filters = defaultFilters
}

export { filters, setupBrands, setupProducts, applyFilters, resetFilters }