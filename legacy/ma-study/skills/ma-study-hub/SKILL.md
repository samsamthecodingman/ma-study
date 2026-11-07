---
name: ma-study-hub
description: "Moved: ma-study is now Study Sauce, and this skill only switches the student to the new study-sauce plugin. Use it for every request it used to handle. Old purpose: Part of the ma-study set (Monash Automation study skills). Quiz a student from the lecture slides in one Study Hub artifact: every quiz in one place, MathJax equations, feedback linking to the lecture video moment and slide page, concept-tagged questions, a progress view by week and concept, spaced repetition, weak-spot revision, sure/guessed confidence and question flags. Use when someone says 'quiz me on week N', 'test me on weeks X-Y', 'quiz my weak spots', asks how their revision is going, or asks for practice questions on a unit that has ma-study-notes notes. Never quiz in plain chat."
---

# ma-study has moved to Study Sauce

This plugin is now called **study-sauce**. This skill only moves the student across; it can't do what they asked. Their notes, Study Sauce page, quizzes and progress all stay where they are.

1. Say in one line: "ma-study is now called Study Sauce. I'll switch you over; your notes, quizzes and progress stay."
2. Run `claude plugin list`. If study-sauce is already there, skip to the uninstall. Otherwise run `claude plugin install study-sauce@monash-automation`; if it can't find study-sauce, run `claude plugin marketplace update monash-automation` and try once more. If the install still fails, don't uninstall anything: show them the error and stop.
   Once study-sauce is installed, run `claude plugin uninstall ma-study@monash-automation`. Do each step once; never loop.
3. If you can't run commands (for example in the Chat tab), tell them instead: type `/plugin`, install **study-sauce** from the monash-automation marketplace, then uninstall **ma-study**.
4. Tell them to start a new session and ask again. The new skills are study-sauce, sauce-kb (notes), sauce-quiz (quizzes) and sauce-pack (quiz packs).
