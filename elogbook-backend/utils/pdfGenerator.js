import PDFDocument from "pdfkit";

const getValueStatus = (value, parameter) => {
  if (value === undefined || value === "") return "No value";

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) return "Text";
  if (parameter?.minValue !== undefined && numericValue < parameter.minValue) {
    return "Below range";
  }
  if (parameter?.maxValue !== undefined && numericValue > parameter.maxValue) {
    return "Above range";
  }

  return "Normal";
};

const getEntryStatus = (entry) => {
  const unit1Status = getValueStatus(entry.unit1Value, entry.parameter);
  const unit2Status = getValueStatus(entry.unit2Value, entry.parameter);

  if (unit1Status === "Below range" || unit2Status === "Below range") {
    return "Out of range";
  }
  if (unit1Status === "Above range" || unit2Status === "Above range") {
    return "Out of range";
  }
  if (
    entry.parameter?.minValue !== undefined ||
    entry.parameter?.maxValue !== undefined
  ) {
    return "Normal";
  }

  return "No limits";
};

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
    .text("Adani Power Limited Shift Operations Report", { align: "center" })
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

  doc.fontSize(14).text("Shift Handover", { underline: true }).moveDown(0.5);

  doc.fontSize(11).text(shift.handoverRemarks || "No handover remarks recorded.");

  doc.moveDown();

  doc.fontSize(14).text("Parameters", { underline: true }).moveDown(0.5);

  if (parameters.length === 0) {
    doc.text("No parameter entries recorded.");
  } else {
    parameters.forEach((p) => {
      const safeRange =
        p.parameter?.minValue !== undefined || p.parameter?.maxValue !== undefined
          ? `${p.parameter?.minValue ?? "-"} - ${p.parameter?.maxValue ?? "-"}`
          : "No limits";

      doc.text(
        `${p.parameter?.name} | Safe: ${safeRange} | Unit1: ${
          p.unit1Value ?? "-"
        } | Unit2: ${p.unit2Value ?? "-"} | Status: ${getEntryStatus(p)}`
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
        `${i.equipment} | Priority: ${i.priority || "medium"} | Status: ${
          i.status
        } | ${i.description}`
      );

      if (i.closureRemarks) {
        doc.text(`Closure: ${i.closureRemarks}`);
      }
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
