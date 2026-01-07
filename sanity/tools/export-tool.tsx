import { UserIcon, BasketIcon } from '@sanity/icons'
import { Card, Flex, Button, Text, Stack } from '@sanity/ui'
import { useClient } from 'sanity'
import React, { useState } from 'react'

export const ExportTool = () => {
  const client = useClient({ apiVersion: '2024-01-01' })
  const [isLoading, setIsLoading] = useState(false)

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const exportOrders = async () => {
    setIsLoading(true)
    try {
      const query = `*[_type == "order"] | order(createdAt desc) {
        _id,
        orderNumber,
        reservationDate,
        "customerName": customer->name,
        "customerEmail": customer->email,
        "customerPhone": customer->phone,
        total,
        amountPaid,
        amountPending,
        status,
        "items": items[] {
          quantity,
          "name": product->name,
          price
        },
        createdAt
      }`
      const orders = await client.fetch(query)

      // 1. Collect all unique item names
      const allItemNames = new Set<string>();
      orders.forEach((order: any) => {
        if (order.items) {
          order.items.forEach((item: any) => {
            if (item.name) allItemNames.add(item.name);
          });
        }
      });
      const sortedItemNames = Array.from(allItemNames).sort();

      // 2. Create Header Row
      const fixedHeaders = ['Orden', 'Fecha', 'Cliente', 'Email', 'Teléfono', 'Total', 'Pagado', 'Pendiente', 'Status', 'Fecha de creación'];
      const headers = [...fixedHeaders, ...sortedItemNames];

      // 3. Create Data Rows
      const rows = orders.map((order: any) => {
        // Create a map of this order's items for quick lookup
        const orderItemsMap = new Map();
        if (order.items) {
          order.items.forEach((item: any) => {
            // If duplicate items exist, sum quantities (though distinct items usually expected)
            const current = orderItemsMap.get(item.name) || 0;
            orderItemsMap.set(item.name, current + item.quantity);
          });
        }

        // Base fields
        const baseRow = [
          order.orderNumber,
          order.reservationDate,
          order.customerName,
          order.customerEmail,
          order.customerPhone,
          order.total,
          order.amountPaid,
          order.amountPending,
          order.status,
          order.createdAt
        ];

        // Item fields (quantity matches)
        const itemRow = sortedItemNames.map(itemName => {
          const qty = orderItemsMap.get(itemName);
          return qty !== undefined ? qty : ''; // Empty string if not present
        });

        return [...baseRow, ...itemRow];
      })

      const csvContent = [
        headers.join(','),
        ...rows.map((row: any[]) => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      downloadCSV(csvContent, `orders-${new Date().toISOString().split('T')[0]}.csv`)

    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Check console for details.')
    } finally {
      setIsLoading(false)
    }
  }

  const exportCustomers = async () => {
    setIsLoading(true)
    try {
      const query = `*[_type == "customer"] | order(name asc) {
        name,
        email,
        phone,
        clerkUserId,
        stripeCustomerId
      }`
      const customers = await client.fetch(query)

      const headers = ['Nombre', 'Email', 'Teléfono', 'Clerk ID', 'Stripe ID']
      const rows = customers.map((c: any) => [
        c.name,
        c.email,
        c.phone,
        c.clerkUserId,
        c.stripeCustomerId
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map((row: any[]) => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      downloadCSV(csvContent, `customers-${new Date().toISOString().split('T')[0]}.csv`)

    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Check console for details.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card padding={4} height="fill">
      <Flex direction="column" gap={4} align="center" justify="center" height="fill">
        <Stack space={4}>
          <Text size={4} weight="bold">Exportar Información</Text>
          <Text muted>Descarga tus datos como archivos CSV.</Text>
          <Flex gap={3}>
            <Button
              fontSize={2}
              icon={BasketIcon}
              text="Ordenes"
              tone="primary"
              onClick={exportOrders}
              loading={isLoading}
              disabled={isLoading}
            />
            <Button
              fontSize={2}
              icon={UserIcon}
              text="Clientes"
              tone="primary"
              onClick={exportCustomers}
              loading={isLoading}
              disabled={isLoading}
            />
          </Flex>
        </Stack>
      </Flex>
    </Card>
  )
}
