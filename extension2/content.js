console.log("Gmail AI Assistant: content script loaded.");


// ============================================================
// CONFIGURATION
// ============================================================

const BACKEND_URL = "http://localhost:8080/api/email/generate";


// ============================================================
// GET EMAIL CONTENT FROM GMAIL
// ============================================================

function getEmailContent() {

    console.log("Trying to extract email content from Gmail...");

    /*
     * Gmail email bodies are commonly present inside
     * elements having the class "a3s".
     *
     * We collect all visible email bodies and currently
     * select the longest one.
     */

    const elements = document.querySelectorAll("div.a3s");

    let emailContent = "";

    elements.forEach((element) => {

        const text = element.innerText?.trim();

        if (text && text.length > emailContent.length) {

            emailContent = text;

        }

    });


    if (!emailContent) {

        console.log("No email content found.");

        return "";

    }


    console.log("Email content found:");
    console.log(emailContent);


    return emailContent;
}


// ============================================================
// FIND GMAIL REPLY WRITING AREA
// ============================================================

function getReplyEditor() {

    console.log("Searching for Gmail reply writing area...");


    /*
     * Gmail's reply editor is normally a contenteditable
     * element with role="textbox".
     *
     * There can be multiple contenteditable elements on
     * Gmail, so we only consider visible elements.
     */

    const editors = document.querySelectorAll(
        '[contenteditable="true"][role="textbox"]'
    );


    console.log(
        "Possible reply editors found:",
        editors.length
    );


    let visibleEditor = null;


    editors.forEach((editor) => {

        const rect = editor.getBoundingClientRect();

        const isVisible =
            rect.width > 0 &&
            rect.height > 0;


        if (isVisible) {

            visibleEditor = editor;

        }

    });


    if (!visibleEditor) {

        console.log(
            "Gmail reply writing area was not found."
        );

        return null;

    }


    console.log(
        "Gmail reply writing area found:",
        visibleEditor
    );


    return visibleEditor;
}


// ============================================================
// INSERT GENERATED REPLY INTO GMAIL
// ============================================================

function insertReplyIntoGmail(replyText) {

    console.log(
        "Trying to insert generated reply into Gmail..."
    );


    if (!replyText || !replyText.trim()) {

        console.error(
            "Cannot insert empty reply."
        );

        return false;

    }


    const editor = getReplyEditor();


    if (!editor) {

        console.error(
            "Could not find Gmail reply editor."
        );

        return false;

    }


    try {

        // ----------------------------------------------------
        // FOCUS THE REPLY EDITOR
        // ----------------------------------------------------

        editor.focus();


        // ----------------------------------------------------
        // SELECT EXISTING CONTENT
        // ----------------------------------------------------

        const selection =
            window.getSelection();


        const range =
            document.createRange();


        range.selectNodeContents(editor);


        selection.removeAllRanges();


        selection.addRange(range);


        // ----------------------------------------------------
        // INSERT GENERATED TEXT
        // ----------------------------------------------------

        /*
         * execCommand("insertText") allows Gmail to recognize
         * the operation as an actual text input.
         *
         * This is generally more reliable than simply doing:
         *
         * editor.innerText = replyText;
         */

        const inserted =
            document.execCommand(
                "insertText",
                false,
                replyText
            );


        // ----------------------------------------------------
        // FALLBACK
        // ----------------------------------------------------

        if (!inserted) {

            console.log(
                "execCommand did not insert text. Using fallback."
            );


            editor.textContent =
                replyText;


            editor.dispatchEvent(
                new InputEvent(
                    "input",
                    {
                        bubbles: true,
                        inputType: "insertText",
                        data: replyText
                    }
                )
            );

        }


        // ----------------------------------------------------
        // TRIGGER INPUT EVENT
        // ----------------------------------------------------

        editor.dispatchEvent(
            new InputEvent(
                "input",
                {
                    bubbles: true,
                    inputType: "insertText",
                    data: replyText
                }
            )
        );


        console.log(
            "Generated reply inserted into Gmail successfully."
        );


        return true;

    }

    catch (error) {

        console.error(
            "Error inserting reply into Gmail:",
            error
        );


        return false;

    }

}


// ============================================================
// CALL SPRING BOOT BACKEND
// ============================================================

async function generateAIReply(emailContent) {

    try {

        console.log(
            "======================================"
        );

        console.log(
            "Sending request to Spring Boot..."
        );

        console.log(
            "======================================"
        );


        console.log(
            "Email content being sent:"
        );

        console.log(
            emailContent
        );


        // ----------------------------------------------------
        // SEND REQUEST
        // ----------------------------------------------------

        const response = await fetch(
            BACKEND_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    emailContent: emailContent,

                    tone: "professional"

                })
            }
        );


        console.log(
            "Spring Boot HTTP Status:",
            response.status
        );


        // ----------------------------------------------------
        // CHECK HTTP RESPONSE
        // ----------------------------------------------------

        if (!response.ok) {

            throw new Error(
                `Spring Boot returned HTTP ${response.status}`
            );

        }


        // ----------------------------------------------------
        // READ PLAIN TEXT RESPONSE
        // ----------------------------------------------------

        /*
         * IMPORTANT:
         *
         * Spring Boot is currently returning the generated
         * reply as plain text, for example:
         *
         * Dear CIMET,
         *
         * Thank you for reaching out...
         *
         * Therefore we MUST use response.text()
         * instead of response.json().
         */

        const generatedReply =
            await response.text();


        console.log(
            "======================================"
        );

        console.log(
            "Response received from Spring Boot"
        );

        console.log(
            "======================================"
        );


        console.log(
            generatedReply
        );


        // ----------------------------------------------------
        // VALIDATE RESPONSE
        // ----------------------------------------------------

        if (
            !generatedReply ||
            !generatedReply.trim()
        ) {

            console.error(
                "Spring Boot returned an empty response."
            );


            throw new Error(
                "Generated reply is empty."
            );

        }


        // ----------------------------------------------------
        // FINAL GENERATED REPLY
        // ----------------------------------------------------

        console.log(
            "======================================"
        );

        console.log(
            "GENERATED AI REPLY"
        );

        console.log(
            "======================================"
        );


        console.log(
            generatedReply
        );


        return generatedReply;

    }

    catch (error) {

        console.error(
            "Error while generating AI reply:",
            error
        );


        throw error;

    }

}


// ============================================================
// CREATE AI-SEND BUTTON
// ============================================================

function createAISendButton() {

    // --------------------------------------------------------
    // PREVENT DUPLICATE BUTTON
    // --------------------------------------------------------

    if (
        document.getElementById(
            "gmail-ai-send-button"
        )
    ) {

        return;

    }


    console.log(
        "Creating AI-Send button..."
    );


    const button =
        document.createElement("button");


    button.id =
        "gmail-ai-send-button";


    button.innerText =
        "AI-Send";


    // ========================================================
    // BUTTON STYLING
    // ========================================================

    button.style.backgroundColor =
        "#1a73e8";

    button.style.color =
        "white";

    button.style.border =
        "none";

    button.style.borderRadius =
        "4px";

    button.style.padding =
        "8px 14px";

    button.style.marginLeft =
        "8px";

    button.style.cursor =
        "pointer";

    button.style.fontSize =
        "14px";

    button.style.fontWeight =
        "500";


    // ========================================================
    // HOVER EFFECT
    // ========================================================

    button.addEventListener(
        "mouseenter",
        () => {

            if (!button.disabled) {

                button.style.backgroundColor =
                    "#1557b0";

            }

        }
    );


    button.addEventListener(
        "mouseleave",
        () => {

            if (!button.disabled) {

                button.style.backgroundColor =
                    "#1a73e8";

            }

        }
    );


    // ========================================================
    // AI-SEND CLICK
    // ========================================================

    button.addEventListener(
        "click",
        async () => {

            console.log(
                "======================================"
            );

            console.log(
                "AI-Send button clicked!"
            );

            console.log(
                "======================================"
            );


            // ------------------------------------------------
            // GET EMAIL CONTENT
            // ------------------------------------------------

            const emailContent =
                getEmailContent();


            if (!emailContent) {

                alert(
                    "Could not find email content."
                );

                return;

            }


            // ------------------------------------------------
            // DISABLE BUTTON
            // ------------------------------------------------

            button.disabled =
                true;


            button.innerText =
                "Generating...";


            button.style.opacity =
                "0.7";


            try {

                // --------------------------------------------
                // CALL SPRING BOOT
                // --------------------------------------------

                const generatedReply =
                    await generateAIReply(
                        emailContent
                    );


                // --------------------------------------------
                // SHOW RESPONSE IN CONSOLE
                // --------------------------------------------

                console.log(
                    "AI generated reply successfully:"
                );


                console.log(
                    generatedReply
                );


                // --------------------------------------------
                // INSERT RESPONSE INTO GMAIL
                // --------------------------------------------

                const inserted =
                    insertReplyIntoGmail(
                        generatedReply
                    );


                if (!inserted) {

                    alert(
                        "AI reply was generated, but Gmail's reply editor could not be found."
                    );

                    return;

                }


                // --------------------------------------------
                // SUCCESS
                // --------------------------------------------

                console.log(
                    "AI reply has been placed in Gmail."
                );


            }

            catch (error) {

                console.error(
                    "AI generation failed:",
                    error
                );


                alert(
                    "Failed to generate AI reply. Check the console."
                );

            }


            finally {

                button.disabled =
                    false;


                button.innerText =
                    "AI-Send";


                button.style.opacity =
                    "1";

            }

        }
    );


    // ========================================================
    // FIND GMAIL SEND BUTTON
    // ========================================================

    const sendButtons =
        document.querySelectorAll(
            '[role="button"]'
        );


    let sendButton =
        null;


    sendButtons.forEach(
        (element) => {

            const ariaLabel =
                element.getAttribute(
                    "aria-label"
                ) || "";


            const text =
                element.innerText || "";


            const combinedText =
                `${ariaLabel} ${text}`.toLowerCase();


            if (
                combinedText.includes("send")
            ) {

                if (!sendButton) {

                    sendButton =
                        element;

                }

            }

        }
    );


    // ========================================================
    // INSERT AI-SEND BUTTON
    // ========================================================

    if (sendButton) {

        const parent =
            sendButton.parentElement;


        if (parent) {

            parent.appendChild(
                button
            );


            console.log(
                "AI-Send button added next to Gmail Send button."
            );


            return;

        }

    }


    console.log(
        "Gmail Send button not found yet."
    );

}


// ============================================================
// MUTATION OBSERVER
// ============================================================

const observer =
    new MutationObserver(
        () => {

            createAISendButton();

        }
    );


observer.observe(
    document.body,
    {
        childList: true,
        subtree: true
    }
);


// ============================================================
// INITIAL CHECK
// ============================================================

createAISendButton();


console.log(
    "Gmail AI Assistant initialized successfully."
);