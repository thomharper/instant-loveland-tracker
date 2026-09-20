
exports.handler = async function () {
  const TATE_URL =
    "https://www.tate.org.uk/art/artworks/olitski-instant-loveland-t07244";

  const checkedAt = new Date().toISOString();

  try {
    const response = await fetch(TATE_URL, {
      headers: {
        "User-Agent": "Instant-Loveland-Tracker/1.0"
      }
    });

    if (!response.ok) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: "CHECK_REQUIRED",
          message: `Tate returned HTTP ${response.status}.`,
          checkedAt
        })
      };
    }

    const html = await response.text();

    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/\s+/g, " ")
      .trim();

    const displayPatterns = [
      /on display at tate modern/i,
      /on display at tate britain/i,
      /currently on display at tate modern/i,
      /currently on display at tate britain/i
    ];

    const isOnDisplay = displayPatterns.some(pattern =>
      pattern.test(text)
    );

    const result = {
      status: isOnDisplay ? "ON_DISPLAY" : "NOT_CONFIRMED",

      message: isOnDisplay
        ? "Tate's website contains evidence that the work is currently on display."
        : "Tate's artwork page does not currently confirm that the work is on public display.",

      source: TATE_URL,
      checkedAt
    };

    return {
      statusCode: 200,

      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      },

      body: JSON.stringify(result)
    };

  } catch (error) {
    return {
      statusCode: 200,

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        status: "CHECK_REQUIRED",
        message: "The Tate check could not be completed.",
        error: error.message,
        checkedAt
      })
    };
  }
};
