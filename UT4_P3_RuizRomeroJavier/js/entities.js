"use strict";

(() => {
    let abstractCreateLock = true;

    class Product {

        //Atributos static
        static TAXES = 21;

        //Atributos privados
        #serial;
        #name;
        #description;
        #price;
        #tax;
        #images;

        constructor(serial, name, price, tax = Product.TAXES) {
            if (!new.target) throw new InvalidAccessConstructorException();
            if (abstractCreateLock) throw new AbstractClassException("Product");
            abstractCreateLock = true;

            //Validación de argumentos
            if (!serial) throw new EmptyValueException("Serial");
            if (!name) throw new EmptyValueException("Name");
            if (!tax || tax < 0) throw new EmptyValueException("Tax", tax);
            price = Number.parseFloat(price);
            if (!price || price <= 0) throw new InvalidValueException("Price", price);

            //Asignación de atributos
            this.#serial = serial.toUpperCase();
            this.#name = name.toUpperCase();
            this.#price = price;
            this.#tax = tax;
            this.#description = "";
            this.#images = [];
        }

        //GETTER
        get serial() {
            return this.#serial;
        }
        get name() {
            return this.#name;
        }
        get description() {
            return this.#description;
        }
        get price() {
            return this.#price;
        }
        get tax() {
            return this.#tax;
        }
        get images() {
            return [...this.#images];
        }

        //SETTER
        set name(value) {
            if (!value) throw EmptyValueException("Name");
            this.#name = value;
        }
        set description(value) {
            if (!value) throw EmptyValueException("Name");
            this.#name = value;
        }
        set tax(value) {
            if (!value) throw EmptyValueException("Name");
            this.#name = value;
        }
        set price(value) {
            price = Number.parseFloat(value);
            if (!price || price <= 0) throw new InvalidValueException("Price", value);
            this.#price = price;
        }
        set addImage(value) {
            if (!value) throw new EmptyValueException("Image");
            this.#images.push(value);
        }
        set removeImage(value) {
            if (!value) throw new EmptyValueException("Image");
            let position = this.#images.findIndex((elem) => elem == value);
            if (position == -1) throw InvalidValueException("No existe la imagen", value);
            this.#images.splice(position, 1);
        }

        //METODOS PÚBLICOS
        toString() {
            return this.#serial + ": " + this.#name + " " + this.#price + " " + this.#tax + " " + this.#description + " " + this.#images;
        }

        priceWithoutTaxes() {
            return this.#price - (this.#price * this.#tax);
        }
    }
    Object.defineProperty(Product.prototype, "serial", { enumerable: true });
    Object.defineProperty(Product.prototype, "name", { enumerable: true });
    Object.defineProperty(Product.prototype, "price", { enumerable: true });
    Object.defineProperty(Product.prototype, "description", { enumerable: true });
    Object.defineProperty(Product.prototype, "tax", { enumerable: true });
    Object.defineProperty(Product.prototype, "images", { enumerable: true });


    class Plant extends Product {

        //Atributos static
        static ERAMBIENT = /^(humidity|dryland|hot|cold)$/i
        static ERLEAF = /^(perenne|caduca)$/i;
        static ERFLOWER = /^(spring|summer|autumm|winter|none)$/i;
        static TAXES = 4;

        //Atributos privados
        #ambient;
        #leaf;
        #flower;
        #color;

        constructor(serial, name, price, ambient, leaf, flower = "none", color = "GREEN") {
            if (!new.target) throw new InvalidAccessConstructorException();
            abstractCreateLock = false;
            super(serial, name, price, Plant.TAXES);

            //Validación de argumentos
            if (!(Plant.ERAMBIENT.test(ambient))) throw new InvalidValueException("Ambient", ambient);
            if (!(Plant.ERLEAF.test(leaf))) throw new InvalidValueException("Leaf", leaf);
            if (!(Plant.ERFLOWER.test(flower))) throw new InvalidValueException("Flower", flower);
            if (!color) throw new InvalidValueException("Color", color);

            //Asignación de atributos
            this.#ambient = ambient.toUpperCase();
            this.#leaf = leaf.toUpperCase();
            this.#flower = flower.toUpperCase();
            this.#color = color.toUpperCase();
        }

        //GETTER
        get ambient() {
            return this.#ambient;
        }
        get leaf() {
            return this.#leaf;
        }
        get flower() {
            return this.#flower;
        }
        get color() {
            return this.#color;
        }

        //SETTER
        set ambient(value) {
            if (!(Plant.ERAMBIENT.test(value))) throw new InvalidValueException("Ambient", value);
            this.#ambient = value;
        }
        set leaf(value) {
            if (!(Plant.ERAMBIENT.test(value))) throw new InvalidValueException("Leaf", value);
            this.#leaf = value;
        }
        set flower(value) {
            if (!(Plant.ERAMBIENT.test(value))) throw new InvalidValueException("Flower", value);
            this.#flower = value;
        }
        set color(value) {
            if (!(value)) throw new EmptyValueException("Color");
            this.#color = value;
        }

        //Métodos públicos
        toString() {
            return super.toString() + " " + this.#ambient + " " + this.#leaf + " " + this.#flower + " " + this.#color;
        }
    }
    Object.defineProperty(Plant.prototype, "ambient", { enumerable: true });
    Object.defineProperty(Plant.prototype, "leaf", { enumerable: true });
    Object.defineProperty(Plant.prototype, "flower", { enumerable: true });
    Object.defineProperty(Plant.prototype, "color", { enumerable: true });


    class Manga extends Product {
        //Atributos static
        static TAXES = Product.TAXES;

        //Atributos privados
        #author;
        #publisher;
        /*Volumes sería un array de los tomos existentes, por si en el futuro hay que hacer subclases, pero lo usaremos unicamente para el número de tomos publicados.
        Ej: si hay 7 tomos se tomará que 7 es la cantidad posible a vender.*/
        #volumes;

        constructor(serial, name, price, author = "unknown", publisher = "unknown", volumes = 1) {
            if (!new.target) throw new InvalidAccessConstructorException();
            abstractCreateLock = false;
            super(serial, name, price, Manga.TAXES);

            //Validación de argumentos
            if (!author) throw new EmptyValueException("Author");
            if (!publisher) throw new EmptyValueException("Publisher");
            let c_vol = Number.parseInt(volumes);
            if (!c_vol || c_vol <= 0) throw new InvalidValueException("Volumes", volumes);

            //Asignación de atributos
            this.#author = author.toUpperCase();
            this.#publisher = publisher.toUpperCase();
            this.#volumes = volumes;
        }

        //GETTER
        get author() {
            return this.#author;
        }
        get publisher() {
            return this.#publisher;
        }
        get volumes() {
            return this.#volumes;
        }

        //SETTER
        set author(value) {
            if (!(value)) throw new EmptyValueException("Author");
            this.#author = value;
        }
        set publisher(value) {
            if (!(value)) throw new EmptyValueException("Publisher");
            this.#publisher = value;
        }
        set volumes(value) {
            let s_vol = Number.parseInt(volumes);
            if (!s_vol || s_vol <= 0) throw new InvalidValueException("Volumes", volumes);
            this.#volumes = value;
        }

        //Métodos públicos
        toString() {
            return super.toString() + " " + this.#author + " " + this.publisher + " " + this.#volumes;
        }
    }
    Object.defineProperty(Manga.prototype, "author", { enumerable: true });
    Object.defineProperty(Manga.prototype, "publisher", { enumerable: true });
    Object.defineProperty(Manga.prototype, "volume", { enumerable: true });


    class Furniture extends Product {
        //Atributos static
        static TAXES = 12;
        static ERTYPE = /^(Wood|Iron|Cristal|Plastic)$/i;
        #type;
        #width;
        #height;
        #deep;

        constructor(serial, name, price, type, width, height, deep) {
            if (!new.target) throw new InvalidAccessConstructorException();
            abstractCreateLock = false;
            super(serial, name, price, Manga.TAXES);

            if (!(Furniture.ERTYPE.test(type))) throw new InvalidValueException("Type", type);
            let c_width = Number.parseInt(width);
            if (!c_width || c_width <= 0) throw new InvalidValueException("Width", width);
            let c_height = Number.parseInt(height);
            if (!c_height || c_height <= 0) throw new InvalidValueException("Height", height);
            let c_deep = Number.parseInt(deep);
            if (!c_deep || c_deep <= 0) throw new InvalidValueException("Deep", deep);

            this.#type = type;
            this.#width = width;
            this.#height = height;
            this.#deep = deep;
        }

        get type() {
            return this.#type;
        }
        get width() {
            return this.#width;
        }
        get height() {
            return this.#height;
        }
        get deep() {
            return this.#deep;
        }
        set type(value) {
            if (!(Furniture.ERTYPE.test(value))) throw new InvalidValueException("Type", value);
            this.#type = value;
        }
        set width(value) {
            s_value = Number.parseInt(value);
            if (!s_value || s_value <= 0) throw new InvalidValueException("Width", value);
            this.#width = value;
        }
        set height(value) {
            s_value = Number.parseInt(value);
            if (!s_value || s_value <= 0) throw new InvalidValueException("Height", value);
            this.#height = value;
        }
        set deep(value) {
            s_value = Number.parseInt(value);
            if (!s_value || s_value <= 0) throw new InvalidValueException("Deep", value);
            this.#deep = value;
        }

        toString() {
            return super.toString() + " " + this.#type + " " + this.#width + " " + this.#height + " " + this.#deep;
        }
    }
    Object.defineProperty(Manga.prototype, "type", { enumerable: true });
    Object.defineProperty(Manga.prototype, "width", { enumerable: true });
    Object.defineProperty(Manga.prototype, "height", { enumerable: true });
    Object.defineProperty(Manga.prototype, "deep", { enumerable: true });

    window.Product = Product;
    window.Plant = Plant;
    window.Manga = Manga;
    window.Furniture = Furniture;

})();