/**
 * KHALIYA RESTAURANT - LOCAL THERMAL PRINT AGENT (ESC/POS 80mm)
 * 
 * Runs on the restaurant cashier computer or LAN server.
 * Connects to ESC/POS 80mm Thermal Printers via TCP Sockets (Port 9100) or RAW USB.
 */

const net = require('net');

// ESC/POS Commands
const ESC = '\x1B';
const GS = '\x1D';

const COMMANDS = {
    INIT: ESC + '@',
    ALIGN_LEFT: ESC + 'a' + '\x00',
    ALIGN_CENTER: ESC + 'a' + '\x01',
    ALIGN_RIGHT: ESC + 'a' + '\x02',
    BOLD_ON: ESC + 'E' + '\x01',
    BOLD_OFF: ESC + 'E' + '\x00',
    DOUBLE_HEIGHT: GS + '!' + '\x10',
    DOUBLE_SIZE: GS + '!' + '\x11',
    NORMAL_SIZE: GS + '!' + '\x00',
    CUT_PAPER: GS + 'V' + '\x42' + '\x00',
    OPEN_DRAWER: ESC + 'p' + '\x00' + '\x19' + '\xFA'
};

/**
 * Format Customer Thermal Bill into raw ESC/POS byte array
 */
function buildCustomerBillEscPos(billData) {
    let buffer = '';
    buffer += COMMANDS.INIT;
    
    // Header
    buffer += COMMANDS.ALIGN_CENTER;
    buffer += COMMANDS.DOUBLE_SIZE;
    buffer += COMMANDS.BOLD_ON;
    buffer += 'KHALIYA RESTAURANT\n';
    buffer += COMMANDS.NORMAL_SIZE;
    buffer += 'Royal Indian Fine Dining\n';
    buffer += `Bill No: ${billData.receiptNo || 'REC-001'}\n`;
    buffer += `Date: ${billData.date || new Date().toLocaleString()}\n`;
    buffer += `Table: ${billData.tableName || 'T01'} | Guest: ${billData.guestName || 'Valued Guest'}\n`;
    buffer += COMMANDS.BOLD_OFF;
    buffer += '------------------------------------------------\n';

    // Item Table
    buffer += COMMANDS.ALIGN_LEFT;
    buffer += COMMANDS.BOLD_ON;
    buffer += 'ITEM                             QTY       AMOUNT\n';
    buffer += COMMANDS.BOLD_OFF;
    buffer += '------------------------------------------------\n';

    if (Array.isArray(billData.items)) {
        billData.items.forEach(it => {
            const name = (it.name || 'Item').padEnd(32).slice(0, 32);
            const qty = (`x${it.quantity || 1}`).padStart(5);
            const amt = (`₹${it.total || 0}`).padStart(10);
            buffer += `${name}${qty}${amt}\n`;
        });
    }

    buffer += '------------------------------------------------\n';

    // Summary
    buffer += COMMANDS.ALIGN_RIGHT;
    buffer += `Subtotal: ₹${billData.subtotal || 0}\n`;
    if (billData.discount > 0) buffer += `Discount: -₹${billData.discount}\n`;
    buffer += `CGST (2.5%): ₹${billData.cgst || 0}\n`;
    buffer += `SGST (2.5%): ₹${billData.sgst || 0}\n`;
    buffer += COMMANDS.BOLD_ON;
    buffer += COMMANDS.DOUBLE_HEIGHT;
    buffer += `GRAND TOTAL: ₹${billData.grandTotal || 0}\n`;
    buffer += COMMANDS.NORMAL_SIZE;
    buffer += COMMANDS.BOLD_OFF;
    buffer += `Payment Method: ${billData.paymentMethod || 'CASH'} (PAID)\n`;
    buffer += '------------------------------------------------\n';

    // Footer
    buffer += COMMANDS.ALIGN_CENTER;
    buffer += 'Thank you for dining at Khaliya!\n';
    buffer += 'Please visit again.\n\n\n';
    buffer += COMMANDS.CUT_PAPER;

    return buffer;
}

/**
 * Format Kitchen Order Ticket (KOT) into raw ESC/POS byte array
 */
function buildKitchenKotEscPos(kotData) {
    let buffer = '';
    buffer += COMMANDS.INIT;
    
    const ticketType = kotData.ticketType || 'KOT'; // KOT, ADDITION, CANCELLATION, REPRINT
    const stationName = kotData.stationName ? ` [${kotData.stationName.toUpperCase()}]` : '';

    // Header
    buffer += COMMANDS.ALIGN_CENTER;
    buffer += COMMANDS.DOUBLE_SIZE;
    buffer += COMMANDS.BOLD_ON;

    if (ticketType === 'ADDITION') {
        buffer += '*** ADDITION TICKET ***\n';
    } else if (ticketType === 'CANCELLATION') {
        buffer += '*** ITEM CANCELLATION ***\n';
    } else if (ticketType === 'REPRINT') {
        buffer += '*** KOT REPRINT ***\n';
    } else {
        buffer += `*** KITCHEN TICKET${stationName} ***\n`;
    }

    buffer += COMMANDS.NORMAL_SIZE;
    buffer += `Order: #${kotData.orderNo || kotData.invoiceNo || '1042'}\n`;
    buffer += COMMANDS.DOUBLE_HEIGHT;
    buffer += `TABLE: ${kotData.tableName || 'T01'}\n`;
    buffer += COMMANDS.NORMAL_SIZE;
    buffer += COMMANDS.BOLD_OFF;
    buffer += `Time: ${kotData.date || new Date().toLocaleTimeString()}\n`;
    buffer += '================================================\n';

    // Items List
    buffer += COMMANDS.ALIGN_LEFT;
    buffer += COMMANDS.BOLD_ON;
    buffer += 'QTY   ITEM DESCRIPTION\n';
    buffer += COMMANDS.BOLD_OFF;
    buffer += '------------------------------------------------\n';

    if (Array.isArray(kotData.items)) {
        kotData.items.forEach(it => {
            const qty = (`[ ${it.quantity || 1} ]`).padEnd(7);
            const name = (it.name || 'Item').toUpperCase();
            buffer += COMMANDS.BOLD_ON;
            buffer += `${qty} ${name}\n`;
            buffer += COMMANDS.BOLD_OFF;

            if (it.specialInstructions || it.note) {
                buffer += `       -> Special: ${it.specialInstructions || it.note}\n`;
            }
        });
    }

    buffer += '================================================\n';

    if (kotData.notes) {
        buffer += COMMANDS.ALIGN_CENTER;
        buffer += COMMANDS.BOLD_ON;
        buffer += `⚠️ NOTE: ${kotData.notes}\n`;
        buffer += COMMANDS.BOLD_OFF;
        buffer += '------------------------------------------------\n';
    }

    buffer += COMMANDS.ALIGN_CENTER;
    buffer += COMMANDS.BOLD_ON;
    buffer += ticketType === 'REPRINT' ? '*** DUPLICATE COPY ***\n\n\n' : '*** URGENT PREPARATION ***\n\n\n';
    buffer += COMMANDS.BOLD_OFF;
    buffer += COMMANDS.CUT_PAPER;

    return buffer;
}

/**
 * Send raw ESC/POS bytes over TCP socket to 80mm printer IP (Port 9100)
 */
function sendToPrinterNetwork(host, port, rawPayload) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        client.setTimeout(5000);

        client.connect(port || 9100, host, () => {
            client.write(Buffer.from(rawPayload, 'binary'), () => {
                client.end();
                resolve({ success: true, message: `Print job sent to ${host}:${port}` });
            });
        });

        client.on('error', (err) => {
            client.destroy();
            reject({ success: false, error: err.message });
        });

        client.on('timeout', () => {
            client.destroy();
            reject({ success: false, error: 'Printer connection timeout' });
        });
    });
}

module.exports = {
    COMMANDS,
    buildCustomerBillEscPos,
    buildKitchenKotEscPos,
    sendToPrinterNetwork
};
