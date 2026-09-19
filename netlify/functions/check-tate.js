exports.handler = async function () {
  const TATE_URL =
    "https://www.tate.org.uk/art/artworks/olitski-instant-loveland-t07244";

  try {
    const response = await fetch(TATE_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; InstantLovelandTracker/1.0)"
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
          message: `Tate returned HTTP ${response.status}.`
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

    const matchedPattern = displayPatterns.find(pattern =>
      pattern.test(text)
    );

    let result;

    if (matchedPattern) {
      result = {
        status: "ON_DISPLAY",
        message: "Tate's page contains explicit evidence that the work is on display.",
        source: TATE_URL
      };
    } else {
      result = {
        status: "NOT_CONFIRMED",
        message:
          "Tate's page does not currently contain explicit evidence that the work is on public display.",
        source: TATE_URL
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({
        checkedAt: new Date().toISOString(),
        ...result
      })
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
        error: error.message
      })
    };
  }
};
