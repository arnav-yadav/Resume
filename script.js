document.getElementById("btn").addEventListener("click", async function () {
    const fileInput = document.getElementById("resumeFile");
    const comments = document.getElementById("text").value.trim();
    let resultsDiv = document.getElementById("results");

    // If the results div doesn't exist, create it
    if (!resultsDiv) {
        resultsDiv = document.createElement("div");
        resultsDiv.id = "results";
        document.body.appendChild(resultsDiv);
    }

    // Clear previous results
    resultsDiv.innerHTML = "";

    // Validate inputs
    if (!fileInput.files[0]) {
        resultsDiv.innerHTML = "<p>Please upload a resume file.</p>";
        return;
    }
    if (!comments) {
        resultsDiv.innerHTML = "<p>Please enter comments or job details.</p>";
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
        // Call Affinda Resume Parsing API
        const response = await fetch("https://api.affinda.com/v1/resumes", {
            method: "POST",
            headers: {
                "Authorization": "Bearer aff_676187aac6448bcceaf28c6caca720d0ad30bc8e", // Replace with a valid API key
            },
            body: formData,
        });

        if (!response.ok) throw new Error("Failed to analyze the resume.");

        const resumeData = await response.json();

        // Extract relevant details (for example, skills)
        const resumeSkills = resumeData.data.skills
            ? resumeData.data.skills.map(skill => skill.name.toLowerCase())
            : [];
        const commentsNormalized = comments.toLowerCase();

        // Function to calculate fuzzy matches (simple approach)
        const fuzzyMatch = (keyword, skillsArray) =>
            skillsArray.some(skill => skill.includes(keyword));

        // Normalize comments and resume skills
        const commentKeywords = commentsNormalized.split(/\s+/);

        // Calculate score based on keyword matching (with fuzzy matching)
        const matchedKeywords = commentKeywords.filter(keyword =>
            fuzzyMatch(keyword, resumeSkills)
        );
        const score = ((matchedKeywords.length / commentKeywords.length) * 100).toFixed(2);

        // Identify missing skills from the comments
        const missingSkills = commentKeywords.filter(
            keyword => !resumeSkills.includes(keyword)
        );

        // Display results
        resultsDiv.innerHTML = `
            <h3>Analysis Results</h3>
            <p><strong>Score:</strong> ${score}%</p>
            <p><strong>Matched Keywords:</strong> ${
                matchedKeywords.join(", ") || "None"
            }</p>
            <p><strong>Suggestions:</strong> Add more relevant skills like ${
                missingSkills.join(", ") || "None"
            }.</p>
        `;
    } catch (error) {
        console.error("Error details:", error);
        resultsDiv.innerHTML = `<p>Error: ${error.message}</p>`;
    }
});
