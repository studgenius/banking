"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function PDFButton({ targetId }: { targetId: string }) {

    const generatePDF = async () => {
        const element = document.getElementById(targetId);
        if (!element) return;

        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const width = pdf.internal.pageSize.getWidth();
        const height = (canvas.height * width) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        pdf.save("transactions.pdf");
    };

    return (
        <button
            onClick={generatePDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
            Download PDF
        </button>
    );
}
