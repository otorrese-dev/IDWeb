let products = [
    { id: 1, nombre: 'Laptop', precio: 3500 }
];

exports.getAllProducts = (req, res) => {
    res.status(200).json({ status: 'success', data: products });
};

exports.createProduct = (req, res) => {
    const { nombre, precio } = req.body;
    if (!nombre || !precio) {
        return res.status(400).json({ status: 'fail', message: 'Faltan campos obligatorios' });
    }
    const newProduct = { id: products.length + 1, nombre, precio: parseFloat(precio) };
    products.push(newProduct);
    res.status(201).json({ status: 'success', data: newProduct });
};