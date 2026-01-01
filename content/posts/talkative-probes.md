---
date: '2024-11-02'
title: 'Talkative Probes'
cover:
  image: images/talkative-probes-diagram.png
description: &description "We fine-tuned an LLM to answer questions about its own hidden state. This work was done during the training phase of Neel Nanda's mechanistic interpretability MATS stream."
summary: *description
---

## Full report

[Link to report](https://docs.google.com/document/d/1Axw7wZFzprQTQUuo5Fq__5CxLLEs7G9RrNrMnXybj2E/edit?tab=t.a7ws69t7mdu7#heading=h.40glp8oj7iq4)

## Motivation

Interpretability methods aim to understand the inner workings of Deep Neural Networks by examining the inner representations (latents). Researchers dedicate a significant amount of time designing experiments to check for the presence of certain concepts in a latent. 

This project asks: Is it possible to finetune a language model to serve as an interpreter that will examine the latents of a DNN and verbalize the encoded information in natural language? Implicit in this question is the hope that a fine-tuned interpreter LM would generalize in out-of-distribution settings, so that it could be useful even in settings without ground truth labels.

If the initial experiments are successful, we can further extend the finetuning so that we can ask the interpreter LM followup questions about a specific latent — turning the interpreter LM into a talkative and interactive probe. We believe that even moderate success in this will be of help to interpretability researchers as it can significantly reduce the hypothesis space they need to examine. 

## Summary

We utilize datasets from 9 different language modeling tasks (see dataset section). We do leave-one-out testing by fine-tuning on 8 of these tasks and check if the interpreter generalizes to the left out task that wasn’t in the training mix. A positive result here would have been exciting as it would indicate something like an instruction tuning phenomena. However, our results here were mostly negative. We find that although the interpreter LM achieves good performance on the in-distribution validation set, it couldn’t do better than the random baseline on the out-of-distribution left-out task. We discuss alternate setups and design choices that may help in improving the results in our discussion section.
