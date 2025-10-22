Frontend

    Viewer: searchable table.

    Manager: CSV upload & “low-stock” panel.

    Admin: users/roles, reports download, Chart.js line chart of stock over time.

Users(Auth & RBAC)
  Groups = admin / manager / viewer
      users(id, email, hash, status); roles(id, name); user_roles(user_id, role_id)
  Middleware: requireAuth (JWT), then requireRole('admin'|'manager'|'viewer')

Inventory
  /items/
    Item(name, category, price, low_stock_threshold, is_active)
    items(id, name, category, price)
          list/read [all]
          create/update/delete [admin]

  /stock/history/ [admin]
 
    Stock(item_id, quantity, updated_at)
    StockHistory(item, delta, balance, created_by, created_at, note)
  /stock/bulk-csv/  [Admin]
    Stock updates: create audit logs entries (manager/admin) + bulk CSV (manager/admin)
      parse rows → validate → upsert quantities.

Reports
   /reports/monthly?month=YYYY-MM (admin)

Audit
    Audit: use the history + change history on Item django-simple-history
    audit_logs(id, user_id, action, entity, entity_id, before, after, at)

Bonus: 
  Trends: per-item timeseries from history (for charts)
    /items/{id}/trend/ 
  Low-stock: email/push trigger
    /notify


