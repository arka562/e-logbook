import PDFDocument from "pdfkit";

export const generateShiftPDF = (res, reportData) => {
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=shift-report.pdf"
  );

  doc.pipe(res);

  const { shift, parameters = [], events = [], issues = [] } = reportData;

  doc
    .fontSize(20)
    .text("Industrial Shift Logbook Report", { align: "center" })
    .moveDown(2);

  doc.fontSize(14).text("Shift Information", { underline: true }).moveDown(0.5);

  doc.fontSize(11);
  doc.text(`Plant: ${shift.plant?.name}`);
  doc.text(`Unit: ${shift.unit?.name}`);
  doc.text(`Shift: ${shift.shiftType}`);
  doc.text(
    `Date: ${new Date(shift.date).toLocaleDateString()}`
  );
  doc.text(`Shift In-Charge: ${shift.shiftInCharge?.name}`);

  doc.moveDown();

  doc.fontSize(14).text("Parameters", { underline: true }).moveDown(0.5);

  if (parameters.length === 0) {
    doc.text("No parameter entries recorded.");
  } else {
    parameters.forEach((p) => {
      doc.text(
        `${p.parameter?.name} | Unit1: ${p.unit1Value ?? "-"} | Unit2: ${p.unit2Value ?? "-"}`
      );
    });
  }

  doc.moveDown();

  doc.fontSize(14).text("Events", { underline: true }).moveDown(0.5);

  if (events.length === 0) {
    doc.text("No events recorded.");
  } else {
    events.forEach((e) => {
      doc.text(
        `${new Date(e.createdAt).toLocaleString()} - ${e.description}`
      );
    });
  }

  doc.moveDown();

  doc.fontSize(14).text("Issues", { underline: true }).moveDown(0.5);

  if (issues.length === 0) {
    doc.text("No issues reported.");
  } else {
    issues.forEach((i) => {
      doc.text(
        `${i.equipment} | Status: ${i.status} | ${i.description}`
      );
    });
  }

  doc.moveDown(2);

  doc
    .fontSize(10)
    .text(
      `Generated on ${new Date().toLocaleString()}`,
      { align: "right" }
    );

  doc.end();
};