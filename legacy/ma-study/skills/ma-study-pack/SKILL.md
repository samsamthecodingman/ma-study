---
name: ma-study-pack
description: "Moved: ma-study is now Study Sauce, and this skill only switches the student to the new study-sauce plugin. Use it for every request it used to handle. Old purpose: Part of the ma-study set. Write a quiz pack (one .json file) from a student's ma-study-notes notes, to import into a Study Hub with New, then Import on a unit page (or Settings, Features, Quiz packs, Import). Works with any coding agent, including Codex CLI, and needs no Claude tools. Use when someone says 'make a quiz pack', 'quiz me in my study hub', 'write questions for week N', or wants quizzes for a Monash unit and no Claude artifact tools are available."
---

# ma-study has moved to Study Sauce

This plugin is now called **study-sauce**. This skill only moves the student across; it can't do what they asked. Their notes, Study Sauce page, quizzes and progress all stay where they are.

1. Say in one line: "ma-study is now called Study Sauce. I'll switch you over; your notes, quizzes and progress stay."
2. Run `claude plugin list`. If study-sauce is already there, skip to the uninstall. Otherwise run `claude plugin install study-sauce@monash-automation`; if it can't find study-sauce, run `claude plugin marketplace update monash-automation` and try once more. If the install still fails, don't uninstall anything: show them the error and stop.
   Once study-sauce is installed, run `claude plugin uninstall ma-study@monash-automation`. Do each step once; never loop.
3. If you can't run commands (for example in the Chat tab), tell them instead: type `/plugin`, install **study-sauce** from the monash-automation marketplace, then uninstall **ma-study**.
4. Tell them to start a new session and ask again. The new skills are study-sauce, sauce-kb (notes), sauce-quiz (quizzes) and sauce-pack (quiz packs).
