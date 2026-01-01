---
date: '2024-08-30'
title: 'Searching for Memory Management Neurons in Transformers'
description: &description "I search for neurons in a Transformer model that delete information from the residual stream. This work was part of my application to Neel Nanda's mechanistic interpretability MATS stream."
summary: *description
---

## Full report

[Link to report](https://docs.google.com/document/d/1_ojmZ90tv34toe5HQS56Braz_YXRwA0KkPsXkocdgyw/edit?usp=sharing)

## Summary

I look for MLP neurons in gpt2-small with very negative cosine similarity between the input and output weight vectors, and then use Neuroscope to look at dataset examples that result in high activations for these neurons. I find some interesting neurons that may serve as memory management, but my results are inconclusive. More experimentation is needed to confirm what these neurons represent, and to establish a causal link between these neurons and the model “intentionally forgetting” information.
