import { LinkIcon, UserIcon, BasketIcon, ShareIcon } from '@sanity/icons'
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
        customerName,
        customerEmail,
        customerPhone,
        total,
        amountPaid,
        amountPending,
        status,
        "items": items[] {
          quantity,
          name,
          price
        },
        createdAt
      }`
      const orders = await client.fetch(query)

      // Convert to CSV
      const headers = ['Order Number', 'Date', 'Customer Name', 'Email', 'Phone', 'Total', 'Paid', 'Pending', 'Status', 'Items', 'Created At']
      const rows = orders.map((order: any) => [
        order.orderNumber,
        order.reservationDate,
        order.customerName,
        order.customerEmail,
        order.customerPhone,
        order.total,
        order.amountPaid,
        order.amountPending,
        order.status,
        order.items ? order.items.map((i: any) => `${i.quantity}x ${i.name}`).join('; ') : '',
        order.createdAt
      ])

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

      const headers = ['Name', 'Email', 'Phone', 'Clerk ID', 'Stripe ID']
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
          <Text size={4} weight="bold">Export Data</Text>
          <Text muted>Download your data as CSV files.</Text>

          <Flex gap={3}>
            <Button
              fontSize={2}
              icon={BasketIcon}
              text="Export Orders"
              tone="primary"
              onClick={exportOrders}
              loading={isLoading}
              disabled={isLoading}
            />
            <Button
              fontSize={2}
              icon={UserIcon}
              text="Export Customers"
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
