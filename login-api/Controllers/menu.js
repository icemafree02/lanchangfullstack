const db = require("../Controllers/db");
const connection = require("../Controllers/association");

exports.read = async (req, res) => {
  try {
    db.query('SELECT * FROM `menu` ', (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        return res.status(500).send('Database query error');
      }
      res.status(200).json(results);
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).send('Server error');
  }
};

exports.getOrder = async (req, res) => {
  try {
    db.query('SELECT * FROM `order` ', (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        return res.status(500).send('Database query error');
      }
      res.status(200).json(results);
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).send('Server error');
  }
};

exports.readID = async (req, res) => {
  const id = req.params.id;
  const query = (sql, params) => {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });
  };
  try {
    const results = await query('SELECT * FROM menu WHERE menu_id = ?', [id]);

    if (results.length === 0) {
      return res.status(404).send('No data found');
    }

    res.status(200).json(results[0]);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).send('Server error');
  }
};

exports.orders = (req, res) => {
  const { tableId, cartItems, orderId } = req.body;

  if (orderId) {
    this.updateOrder(req, res);
  } else {
    const createOrderQuery = 'INSERT INTO `Order` (tables_id, Order_datetime, status_id) VALUES (?, NOW(), ?)';
    const createOrderValues = [tableId, '3'];

    db.query(createOrderQuery, createOrderValues, (err, newOrderResult) => {
      if (err) {
        console.error('Error creating new order:', err);
        return res.status(500).send('Server error creating new order');
      }

      const newOrderId = newOrderResult.insertId;

      if (cartItems && cartItems.length > 0) {
        this.addItemsToOrder(newOrderId, cartItems, res);
      } else {
        res.json({ orderId: newOrderId });
      }
    });
  }
};

exports.updateOrder = (req, res) => {
  const { orderId, cartItems } = req.body;

  if (cartItems && cartItems.length > 0) {
    this.addItemsToOrder(orderId, cartItems, res);
  } else {
    res.json({ message: 'No items to add to the order' });
  }
};

exports.addItemsToOrder = (req, res) => {
  const { orderId } = req.params;
  const { cartItems } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: 'No items to add to the order' });
  }
  const insertQuery = `
    INSERT INTO Order_detail 
    (Order_detail_quantity, 
    Order_detail_price, 
    Order_detail_takehome, 
     Order_detail_additional,
      Order_id, 
      Menu_id, 
     Promotion_Menu_Item_id,
      status_id,
      Order_detail_created_at,
      Noodle_type_id, 
     Soup_id,
      Meat_id,
       Size_id) 
    VALUES ?
  `;
  const values = cartItems.map(item => [
    item.quantity,
    item.price,
    item.homeDelivery || 0,
    item.additionalInfo || null,
    orderId,
    item.type === 'menu' ? item.id : null,
    null,
    '3',
    new Date(),
    item.type === 'noodle' ? item.id.Noodle_type_id : null,
    item.type === 'noodle' ? item.id.Soup_id : null,
    item.type === 'noodle' ? item.id.Meat_id : null,
    item.type === 'noodle' ? item.id.Size_id : null
  ]);

  db.query(insertQuery, [values], (err, result) => {
    if (err) {
      console.error('Error adding items to order:', err);
      return res.status(500).json({ message: 'Error adding items to order' });
    }

    res.json({ message: 'Items added to order successfully', affectedRows: result.affectedRows });
  });
};

exports.orderID = async (req, res) => {
  try {
    const { orderId } = req.params;
    db.query(
      `SELECT od.*, 
        CASE 
          WHEN m.Menu_id IS NOT NULL THEN m.Menu_name
          ELSE CONCAT(
            nt.noodle_type_name, ' ',
            s.soup_name, ' ',
            mt.meat_name, ' ',       
            sz.size_name      
          )
        END AS name,
        COALESCE(m.Menu_price, od.Order_detail_price) AS price
       FROM Order_detail od
       LEFT JOIN Menu m ON od.Menu_id = m.Menu_id
       LEFT JOIN noodle_type nt ON od.Noodle_type_id = nt.noodle_type_id
       LEFT JOIN soup s ON od.Soup_id = s.soup_id
       LEFT JOIN meat mt ON od.Meat_id = mt.meat_id
       LEFT JOIN size sz ON od.Size_id = sz.size_id
       WHERE od.Order_id = ?`,
      [orderId],
      (err, results) => {
        if (err) {
          console.error('Error fetching order details:', err);
          return res.status(500).send('Error fetching order details');
        }
        res.json(results);
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server error');
  }
};


exports.callstaff = (req, res) => {
  const orderId = req.params.orderId;
  const orderQuery = 'UPDATE `Order` SET status_id = ? WHERE Order_id = ?';
  const detailsQuery = 'UPDATE order_detail SET status_id = ? WHERE Order_id = ? AND status_id = ?';

  db.beginTransaction(err => {
    if (err) {
      console.error('Error beginning transaction:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    db.query(orderQuery, ['5', orderId], (err, orderResult) => {
      if (err) {
        return db.rollback(() => {
          console.error('Error updating order status:', err);
          res.status(500).json({ error: 'Internal server error' });
        });
      }
      if (orderResult.affectedRows === 0) {
        return db.rollback(() => {
          res.status(404).json({ message: 'Order not found' });
        });
      }

      db.query(detailsQuery, ['5', orderId, '4'], (err, detailsResult) => {
        if (err) {
          return db.rollback(() => {
            console.error('Error updating order details status:', err);
            res.status(500).json({ error: 'Internal server error' });
          });
        }
        db.commit(err => {
          if (err) {
            return db.rollback(() => {
              console.error('Error committing transaction:', err);
              res.status(500).json({ error: 'Internal server error' });
            });
          }
          res.status(200).json({
            message: 'Order status updated to รอชำระเงิน',
            updatedDetails: detailsResult.affectedRows
          });
        });
      });
    });
  });
};

exports.getAssociation = async (req, res) => {
  try {
    const query = `
      SELECT 
        order_detail.order_id,
        GROUP_CONCAT(
          CASE 
            WHEN menu.menu_name IS NOT NULL THEN menu.menu_name
            ELSE CONCAT(
              COALESCE(soup.soup_name, 'Unknown Soup'), ':',
              COALESCE(noodle_type.noodle_type_name, 'Unknown Noodle'), ':',
              COALESCE(meat.meat_name, 'Unknown Meat'), ':',
              COALESCE(size.size_name, 'Unknown Size')
            )
          END
        ) AS items
      FROM order_detail
      LEFT JOIN menu ON order_detail.menu_id = menu.menu_id
      LEFT JOIN noodle_type ON order_detail.noodle_type_id = noodle_type.noodle_type_id
      LEFT JOIN soup ON order_detail.soup_id = soup.soup_id
      LEFT JOIN meat ON order_detail.meat_id = meat.meat_id
      LEFT JOIN size ON order_detail.size_id = size.size_id
      GROUP BY order_detail.order_id`;

    const [rows] = await connection.query(query);

    console.log("Query Result:", rows);

    if (!rows || rows.length === 0) {
      return res.json({
        success: true,
        data: {
          transactions: [],
          totalTransactions: 0
        }
      });
    }

    const transactions = rows.map(row => {
      const items = row.items 
        ? row.items.split(',').map(item => item.trim()).filter(item => item !== '') 
        : [];
      return {
        orderId: row.order_id,
        items: items
      };
    });

    res.json({
      success: true,
      data: {
        transactions: transactions,
        totalTransactions: transactions.length
      }
    });

  } catch (error) {
    console.error('Error in getAssociation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};








