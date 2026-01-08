import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface OrderEmailDetails {
  customerName: string;
  orderNumber?: string;
  date: string;
  time?: string;
  locationName: string;
  locationAddress: string[];
  extras: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  amountPaid: number;
  amountPending: number;
}

export async function sendOrderConfirmationEmail(to: string, details: OrderEmailDetails) {
  const { customerName, orderNumber, date, time, locationName, locationAddress, extras, total, amountPaid, amountPending } = details;

  const extrasHtml = extras.map(extra => `
    <div style="display: flex; justify-content: space-between; margin-bottom: 5px; color: #555;">
      <span>• ${extra.name} - (${extra.quantity})</span>
      <span>$${extra.price * extra.quantity}</span>
    </div>
  `).join('');

  const addressHtml = locationAddress.map(line => `<p style="margin: 0; color: #666;">${line}</p>`).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; background-color: #ffffff;">
      <div style="text-align: center; padding: 20px 0;">
        <img src="https://coolmorning.com.mx/wp-content/uploads/2024/10/cropped-logotipo-cool-120x56.png" alt="Cool Morning" style="height: 50px; object-fit: contain;">
      </div>

      <div style="padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <h2 style="color: #04A595; font-size: 18px; margin-top: 0;">¡Gracias por tu compra, ${customerName}!</h2>
        <p>Tu reserva ha sido confirmada. Aquí están los detalles:</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />

        <h3 style="color: #04A595; font-size: 14px; text-transform: uppercase;">Orden</h3>
        <p style="margin: 5px 0; font-weight: bold;">${orderNumber || 'Pendiente (revisa tus reservas en nuestra web)'}</p>

        <h3 style="color: #04A595; font-size: 14px; text-transform: uppercase;">Fecha y Hora</h3>
        <p style="margin: 5px 0; font-weight: bold;">${date}</p>
        ${time ? `<p style="margin: 0; color: #666;">${time}</p>` : ''}

        <h3 style="color: #04A595; font-size: 14px; text-transform: uppercase; margin-top: 20px;">Lugar</h3>
        <p style="margin: 5px 0; font-weight: bold;">${locationName}</p>
        ${addressHtml}

        ${extras.length > 0 ? `
          <h3 style="color: #04A595; font-size: 14px; text-transform: uppercase; margin-top: 20px;">Extras</h3>
          ${extrasHtml}
        ` : ''}

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />

        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="font-weight: bold; font-size: 18px;">Total</span>
          <span style="font-weight: bold; font-size: 18px;">$${total} MXN</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; color: #666;">
          <span>Pagado</span>
          <span>$${amountPaid} MXN</span>
        </div>
        
        ${amountPending > 0 ? `
          <div style="background-color: #fffbeb; padding: 10px; border-radius: 4px; margin-top: 15px; border: 1px solid #fcd34d;">
            <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>Pendiente: $${amountPending} MXN</strong></p>
            <p style="margin: 5px 0 0 0; color: #b45309; font-size: 12px;">El restante deberá liquidarse 2 días antes de la reserva.</p>
          </div>
        ` : ''}

      </div>

      <div style="background-color: #04A595; color: white; padding: 20px; text-align: center; margin-top: 30px; border-radius: 8px;">
          <h4 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.9);">Contacto</h4>
          
          <div style="margin-bottom: 15px;">
             <a href="https://wa.me/528711390732" style="color: white; text-decoration: none; margin: 0 10px; display: inline-block;">
                <!-- WhatsApp Icon -->
                <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" alt="WhatsApp" width="24" height="24" style="vertical-align: middle;">
             </a>
             <a href="https://www.facebook.com/CoolMorningLaguna/" style="color: white; text-decoration: none; margin: 0 10px; display: inline-block;">
                <!-- Facebook Icon -->
                <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" width="24" height="24" style="vertical-align: middle;">
             </a>
             <a href="https://www.instagram.com/coolmorning/" style="color: white; text-decoration: none; margin: 0 10px; display: inline-block;">
                <!-- Instagram Icon -->
                <img src="https://cdn-icons-png.flaticon.com/512/733/733558.png" alt="Instagram" width="24" height="24" style="vertical-align: middle;">
             </a>
          </div>

          <a href="https://coolmorning.com.mx/" style="color: rgba(255,255,255,0.9); text-decoration: none; font-size: 12px; letter-spacing: 1px; font-weight: bold;">COOLMORNING.COM.MX</a>
          
          <p style="margin-top: 15px; font-size: 10px; color: rgba(255,255,255,0.6);">© Copyright Cool Morning.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: '"Cool Morning" <' + process.env.EMAIL_USER + '>',
    to,
    subject: `Confirmación de Reserva - ${date}`,
    html,
  });
}
