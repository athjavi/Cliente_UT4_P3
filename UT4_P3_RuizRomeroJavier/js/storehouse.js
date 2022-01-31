"use strict";

import {
    BaseException,
    AbstractClassException,
    InvalidAccessConstructorException,
    InvalidValueException,
    EmptyValueException,
    WrongObjectTypeException
} from "./exceptions.js";
import { Store } from "./store.js";
import { Category } from "./category.js";
import { Product, Plant, Manga, Furniture } from "./entities.js";

class AlreadyExistingCategoryException extends BaseException {
    constructor(category, fileName, lineNumber) {
        super(`Error: The category already exists Category: ${category}`, fileName, lineNumber);
        this.name = "AlreadyExistingCategoryException";
    }
}

class CannotBeDeletedException extends BaseException {
    constructor(name, category, fileName, lineNumber) {
        super(`Error: The ${name} ${category} cannot be deleted.`, fileName, lineNumber);
        this.name = "CannotBeDeletedException";
    }
}

class NotFoundException extends BaseException {
    constructor(name, category, fileName, lineNumber) {
        super(`Error: The ${name} ${category} doesn't exists.`, fileName, lineNumber);
        this.name = "NotFoundException";
    }
}


let StoreHouse = (function () {
    let instantiated;

    function init(storeHouseName) {

        class StoreHouse {
            //Atributos privados
            #stores = new Map();
            #categories = new Map();
            #name;
            /**
             * Constructor for storehouse class
             * @param {*} storeHouseName String
             */
            constructor(storeHouseName = "") {
                if (!new.target) throw new WrongObjectTypeException("Category");
                this.#name = storeHouseName;
                this.#stores.set("DEFAULT", { store: new Store("Default"), products: new Map() });
                this.#categories.set("DEFAULT", new Category("Default"));
            }

            get name() {
                return this.#name;
            }

            set name(value) {
                if (!value) throw new InvalidValueException("Name", value);
                this.#name = value;
            }

            get categories() {
                return this.#categories.values();
            }

            get stores() {
                let nextIndex = 0;
                let array = [];
                this.#stores.forEach(elem => array.push(elem.store));
                return {
                    *[Symbol.iterator]() {
                        for (let product of array) {
                            yield product;
                        }
                    }
                }
            }

            /**
             * Añade una categoría al storehouse
             * @param {*} cat Category
             * @returns Integer
             */
            addCategory(cat) {
                if (!(cat instanceof Category)) throw new WrongObjectTypeException("Category");
                if (this.#categories.has(cat.title)) throw new AlreadyExistingCategoryException(cat.title);
                this.#categories.set(cat.title, cat);
                return this.#categories.size;
            }

            /**
             * Elimina una categoría y actualiza los productos relacionados.
             * @param {*} cat Category
             * @returns integer
             */
            removeCategory(cat) {
                if (!(cat instanceof Category)) throw new WrongObjectTypeException("Category");
                if (cat.title == this.#categories.get("DEFAULT").title) throw new CannotBeDeletedException("Category", cat.title);
                if (!(this.#categories.has(cat.title))) throw new NotFoundException("Category", cat.title);

                this.#stores.forEach(store => {
                    store.products.forEach(product => {
                        //Busca los productos que contengan la categoría dada.
                        let pos = product.categories.findIndex((category => cat.title == category));
                        if (pos != -1) {
                            //Si tiene unicamente esa categoría se elimina y se añade DEFAULT,
                            //si tiene más de una únicamente se elimina la pasada por parámetro.
                            if (product.categories.length <= 1) {
                                product.categories.length = 0;
                                product.categories.push("DEFAULT");
                            } else {
                                product.categories.splice(pos, 1);
                            }
                        }
                    })
                })
                this.#categories.delete(cat.title);
                return this.#categories.size;
            }

            /**
             * Añade una tienda al storehouse
             * @param {*} store Store
             * @returns Integer
             */
            addStore(store) {
                if (!(store instanceof Store)) throw new WrongObjectTypeException("Store");
                if (this.#stores.has(store.cif)) throw new AlreadyExistingCategoryException(store.cif);
                this.#stores.set(store.cif,
                    {
                        store: store,
                        products: new Map(),
                    });
                return this.#stores.size;
            }

            /**
             * Elimina una tienda del storehouse con toda su información contenida.
             * @param {*} store Store
             * @returns integer
             */
            removeStore(store) {
                if (!(store instanceof Store)) throw new WrongObjectTypeException("Store");
                if (!(this.#stores.has(store.cif))) throw new NotFoundException("Store", store.cif);
                this.#stores.delete(store.cif);
                return this.#stores.size;
            }

            /**
             * Añade un producto al storehouse en la tienda por defecto.
             * @param {*} prod Product
             * @param  {...any} categories Array[Category]
             * @returns Integer
             */
            addProduct(prod, ...categories) {
                if (!(prod instanceof Product)) throw new WrongObjectTypeException("Product");
                let _categories = [];
                if (categories.length < 1) _categories.push("DEFAULT");
                categories.forEach(elem => {
                    if (!(elem instanceof Category)) throw new WrongObjectTypeException("Category");
                    if (!(this.#categories.has(elem.title.toUpperCase()))) throw new NotFoundException("Category", elem.title);
                    _categories.push(elem.title.toUpperCase())
                });
                this.#stores.get("DEFAULT").products.set(prod.serial,
                    {
                        product: prod,
                        categories: _categories
                    });
                return this.#stores.get("DEFAULT").products.size;
            }

            /**
             * Elimina un producto del storehouse, actualizando así las tiendas que lo contengan.
             * @param {*} prod Product
             * @returns integer
             */
            removeProduct(prod) {
                if (!(prod instanceof Product)) throw new WrongObjectTypeException("Store");
                if (!(this.#stores.get("DEFAULT").products.has(prod.serial))) throw new NotFoundException("Product", prod.serial);
                this.#stores.forEach(elem => {
                    elem.products.delete(prod.serial);
                });
                return this.#stores.get("DEFAULT").products.size;
            }

            /**
             * Añade un producto a una tienda con un stock determinado.
             * @param {*} prod Product
             * @param {*} store Store
             * @param {*} stock Integer
             * @returns Integer
             */
            addProductInStore(prod, store, stock = 1) {
                if (!(prod instanceof Product)) throw new WrongObjectTypeException("Product");
                if (!(store instanceof Store)) throw new WrongObjectTypeException("Store");
                let _stock = Number.parseInt(stock);
                if (!_stock || _stock < 0) throw new InvalidValueException("Stock", stock);
                if (!(this.#stores.has(store.cif))) throw new NotFoundException("Store", store.cif);
                if (!(this.#stores.get("DEFAULT").products.has(prod.serial))) throw new NotFoundException("Product", prod.serial);

                let obj = this.#stores.get("DEFAULT").products.get(prod.serial);
                obj.stock = stock;
                this.#stores.get(store.cif).products.set(prod.serial, obj);
                return this.#stores.get(store.cif).products.size;
            }

            /**
             * Añade un producto a una tienda con un stock determinado o actualiza el mismo si ya existe.
             * @param {*} prod Product
             * @param {*} store Store
             * @param {*} stock Integer
             * @returns Integer
             */
            addQuantityProductInStore(prod, store, stock) {
                if (!(prod instanceof Product)) throw new WrongObjectTypeException("Product");
                if (!(store instanceof Store)) throw new WrongObjectTypeException("Store");
                let _stock = Number.parseInt(stock);
                if (!_stock || _stock < 1) throw new InvalidValueException("Stock", stock);
                if (!(this.#stores.has(store.cif))) throw new NotFoundException("Store", store.cif);
                if (!(this.#stores.get("DEFAULT").products.has(prod.serial))) throw new NotFoundException("Product", prod.serial);

                //Si el producto no existe en la tienda se añade, si existe el stock se actualiza
                if (!(this.#stores.get(store.cif).products.has(prod.serial))) {
                    this.addProductInStore(prod, store, stock);
                } else {
                    this.#stores.get(store.cif).products.get(prod.serial).stock += +stock;
                }
                return this.#stores.get(store.cif).products.size;
            }

            /**
             * Devuelve un iterador de los productos por categoría, y filtrados por tipo en caso de haberlo.
             * @param {*} cat Category
             * @param {*} type String
             * @returns Iterator[Product, Stock]
             */
            getCategoryProducts(cat, type = "") {
                if (!(cat instanceof Category)) throw new WrongObjectTypeException("Category");
                if (!(this.#categories.has(cat.title))) throw new NotFoundException("Category", cat.title);
                let _provisional = new Map();
                if (type) { type = "INTERN" + type.toUpperCase(); }
                this.#stores.forEach(store => {
                    store.products.forEach(product => {
                        if (product.categories.findIndex(elem => elem == cat.title) != -1) {
                            if (type != "") {
                                if (type == product.product.__proto__.constructor.name.toUpperCase()) {
                                    let obj = {
                                        product: product.product,
                                        stock: product.stock
                                    }
                                    _provisional.has((product).product.serial) ?
                                        _provisional.get((product).product.serial).stock += product.stock :
                                        _provisional.set(product.product.serial, obj);
                                }
                            } else {
                                let obj = {
                                    product: product.product,
                                    stock: product.stock
                                }
                                _provisional.has(product.product.serial) ?
                                    _provisional.get(product.product.serial).stock += product.stock :
                                    _provisional.set(product.product.serial, obj);
                            }
                        }
                    })
                })
                let _array = Array.from(_provisional.values());
                let nextIndex = 0;
                return {
                    *[Symbol.iterator]() {
                        for (let product of _array) {
                            yield product;
                        }
                    }
                }
            }

            /**
             * Devuelve un iterador con los productos de la tienda, si hay tipo han de cumplirlo.
             * @param {*} store Store
             * @param {*} type String
             * @returns Iterator
             */
            getStoreProducts(store, type = "") {
                if (!(store instanceof Store)) throw new WrongObjectTypeException("Store");
                if (!(this.#stores.has(store.cif))) throw new NotFoundException("Store", store.cif);
                let _array = [];
                if (type) { type = "INTERN" + type.toUpperCase(); }
                this.#stores.get(store.cif).products.forEach(prod => {
                    if (type != "") {
                        if (type == prod.product.__proto__.constructor.name.toUpperCase()) {
                            let obj = {
                                product: prod.product,
                                stock: prod.stock
                            }
                            _array.push(obj);
                        }
                    } else {
                        let obj = {
                            product: prod.product,
                            stock: prod.stock
                        }
                        _array.push(obj);
                    }
                });
                let nextIndex = 0;
                return {
                    *[Symbol.iterator]() {
                        for (let product of _array) {
                            yield product;
                        }
                    }
                }
            }


            *[Symbol.iterator]() {
                for (const it of this.#stores) {
                    yield it;
                }
            }

        }
        Object.defineProperty(StoreHouse.prototype, "stores", { enumerable: true });
        Object.defineProperty(StoreHouse.prototype, "categories", { enumerable: true });

        let sh = new StoreHouse(storeHouseName);//Devolvemos el objeto StoreHouse para que sea una instancia única.
        Object.freeze(sh);
        return sh;
    } //Fin inicialización del Singleton
    return {
        // Devuelve un objeto con el método getInstance
        getInstance: function (storeHouseName) {
            if (!instantiated) { //Si la variable instantiated es undefined, priemera ejecución, ejecuta init.
                instantiated = init(storeHouseName);
            }
            return instantiated; //Si ya está asignado devuelve la asignación.
        }
    };
})();

export {
    StoreHouse,
    AlreadyExistingCategoryException,
    CannotBeDeletedException,
    NotFoundException
};