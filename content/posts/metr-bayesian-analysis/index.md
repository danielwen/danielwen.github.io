---
date: '2026-05-20'
title: 'Bayesian Analysis of METR Data'
cover:
  image: images/metr-bayesian-capability-trend-piecewise.png
description: &description "I re-analyze METR's data on LLM capabilities using a Bayesian approach. My best model predicts a task doubling time of 190 days."
summary: *description
math: true
ShowToc: true
TocOpen: true
---

## Introduction

The capabilities of large language models (LLMs) have been improving rapidly, and measuring the pace of progress is crucial for informing AI policy decisions. To quantify the capabilities of AI models, an independent non-profit Model Evaluation and Threat Research (METR) evaluated whether various models could complete complex tasks. Extrapolating, they predict that in under a decade, AI will be able to complete tasks that take human experts weeks or months to complete [^1].

The METR analysis was originally done using frequentist methods. However, the METR data is particularly suitable for Bayesian methods because of the hierarchical structure and relatively small amount of data. In this project, I re-analyse the data using a Bayesian approach, comparing three hierarchical models and reporting the capability trend.

## Background

### METR analysis

The METR analysis was done as follows. First, they collect a set of 170 tasks of varying difficulty, ranging from things like finding a fact on Wikipedia to training an image model. To quantify the difficulty of a task, they record the amount of time it takes for human experts to complete it.

Next, they collect a set of 33 LLMs that were released over the past few years (e.g. GPT-3, GPT-4, etc). Each model attempts to complete each task using an agentic framework, and the success or failure of each attempt is recorded. For each model \(i\), a logistic regression is fitted to predict the model's success or failure, given task difficulty:

$$
p_{ij} = \sigma(w_i\log_2 t_j + b_i)
$$

where \(t_j\) is the mean number of minutes it takes for a human to complete task \(j\), and \(p_{ij}\) is the predicted probability that model \(i\) succeeds at task \(j\).

The capability of a model \(c_i\) is then defined as the task difficulty (in log-minutes) corresponding to the predicted 50% success rate:

$$
\begin{align*}
0.5 &= \sigma(w_i c_i + b_i) \\
\Rightarrow c_i &= -\frac{b_i}{w_i}
\end{align*}
$$

Finally, a linear regression is performed to identify the trend between model capability and model release date.

### Bayesian re-analysis of METR data

Recent work by Moss [^2] also re-analyzes the METR data using Bayesian methods, comparing different functions modeling the relationship between capability and release date. Key differences between their work and mine are:
 * I use different, smaller parameterizations, including a piecewise linear model to capture the observed "bend" in the capability trend.
 * I perform posterior predictive checks to evaluate goodness of fit.
 * Their implementation is in Stan, while mine is in PyMC.

## Basic model

My first hierarchical model is a straightforward Bayesian reformulation of the original frequentist approach by METR.

At the top of the hierarchical model is a Bayesian simple linear regression. It models the relationship between model capability \(c_i\) and model release date, where \(\delta_i\) is the model release date (in days, centered on the mean and scaled to have variance 1).

$$
\begin{align*}
\alpha_0, \alpha_1 &\overset{\text{iid}}{\sim} N(0, \tau=1) \\
\tau_c &\sim \mathrm{Exp}(1) \\
c_i &\sim N(\alpha_0 + \alpha_1 \delta_i, \tau_c)
\end{align*}
$$

The original logistic regression can be rewritten in terms of \(c_i\) (the task difficulty in log-minutes corresponding to the predicted 50% success rate):

$$
p_{ij} = \sigma(w_i'(\log_2 t_j - c_i))
$$

We know \(w_i' < 0\) since LLMs succeed at shorter tasks and fail at longer tasks. So it can be modeled as \(w_i' = -e^{\beta_i}\) with a normal prior on \(\beta_i\). That gives the following likelihood:

$$
\begin{align*}
\beta_i &\sim N(0, \tau=1) \\
p_{ij} &= \sigma\left(e^{\beta_i} (c_i - \log_2 t_j)\right) \\
X_{ij} &\sim \mathrm{Bin}(n_{ij}, p_{ij})
\end{align*}
$$

where \(n_{ij}\) is the number of times model \(i\) attempted task \(j\), and \(X_{ij}\) is the number of successes. There are some (model, task) combinations that do not have any attempts recorded, so they should not be included in the likelihood; in practice, \(X_{ij}\) and \(n_{ij}\) are set to 0 so that the likelihood is constant (with respect to parameters) for that combination.

I also standardize \(\log_2 t_j\) so that it has mean 0 and variance 1 before inputting it to the model.

For sampling, I use the NUTS sampler with 4 chains, 2000 draws, and target accept rate 0.8.

To check the fit, I do a posterior predictive check. From this plot, we can see that the posterior prediction does not quite match the observed data.

{{< figure src="images/ppc_basic.png" caption="PPC for the basic model." alt="Basic model PPC" >}}

To investigate this discrepancy, I plot a separate PPC for each LLM, comparing the empirical task success rates to the success rates computed from the posterior predictive samples. We can see that the posterior predictive samples do not fully cover the variance of the observed success rates; in particular, when the task difficulty is around the 50% success rate for the model, the observed success rates are much more noisy than predicted.

{{< figure src="images/ppc_basic_per_model.png" caption="PPC scatter plots for each LLM under the basic model. Compare empirical task success rates (blue) vs success rates computed from posterior predictive samples (orange). The black curve is the logistic regression determined by the posterior mean of \(\beta_i\) and \(c_i\)." alt="Basic model PPC (per model)" >}}

## Model with per-task variables

The basic model does not account for variance in task difficulty, since the METR data only reports the mean of the time taken per task. In the original work by METR, this problem is mitigated by estimating variance through bootstrap sampling. There is also some uncertainty from measuring task difficulty based on the amount of time it takes humans to complete it.

For a Bayesian reformulation, we should account for this variance using additional variables. Instead of inputting the task time \(t_j\) directly, I add some noise to get the task difficulty \(d_j\):

$$
\begin{align*}
\tau_d &\sim \mathrm{Exp}(1) \\
d_j &\sim N(\log_2 t_j, \tau_d) \\
p_{ij} &= \sigma\left(e^{\beta_i} (c_i - d_j)\right)
\end{align*}
$$

After sampling 10,000 draws (more draws are needed due to the increase in the number of parameters), I perform another posterior predictive check. We can see that, compared to the basic model, the predictions of this model more closely resemble the observations, though they are still not quite the same.

{{< figure src="images/ppc_task_vars.png" caption="PPC for the model with per-task variables." alt="Per-task variables PPC" >}}

Below is the PPC broken down by LLM. Here, we also see an improvement in the similarity between the observed and sampled success rates.

{{< figure src="images/ppc_task_vars_per_model.png" caption="PPC scatter plots for each LLM under the model with per-task variables. Compare empirical task success rates (blue) vs success rates computed from posterior predictive samples (orange). The black curve is the logistic regression determined by the posterior mean of \(\beta_i\) and \(c_i\)." alt="Per-task variables PPC (per model)" >}}

We can plot the overall capability trend predicted by this model:

{{< figure src="images/capability_trend.png" caption="Capability trend predicted by the model with per-task variables. Error bars indicate 94\% HDI, and black line is the linear regression determined by the posterior mean of \(\alpha_0\) and \(\alpha_1\)." alt="Capability trend predicted by model with per-task variables" >}}

We also compute the task doubling time, i.e. the number of days it takes to release a model that can succeed at tasks taking humans twice the time. More precisely, the doubling time is obtained by solving for \(x\) in the modeled relationship between task time \(t\) and release date \(\delta\):

$$
\begin{align*}
&\begin{cases}
t = 2^{\alpha_0 + \alpha_1\delta} \\
2t = 2^{\alpha_0 + \alpha_1(\delta + x)}
\end{cases} \\
&\Rightarrow x = \frac{1}{\alpha_1}
\end{align*}
$$

Under this model, the posterior mean of the doubling time is 190 days. The 94% HDI is 146 to 234 days, which includes the original METR estimate of 7 months.

|  | mean | sd | hdi_3% | hdi_97% |
|---|---|---|---|---|
| doubling | 190 | 24 | 148 | 235 |

However, there is a noticeable bend in the data points that cannot be reflected by the linear trend.

## Piecewise linear model

To try to model the bend in the capability trend, we can use a piecewise linear function. Specifically, I postulate there is some release date \(\delta^*\) such that the slope is different before and after that date:

$$
\begin{align*}
\alpha_0, \alpha_1, \alpha_2 &\overset{\text{iid}}{\sim} N(0, \tau=1) \\
\delta^* &\sim N(0, \tau=1) \\
m &= \begin{cases}
      \alpha_1, & \delta_i < \delta^* \\
      \alpha_2, & \delta_i \ge \delta^*
   \end{cases} \\
c_i &\sim N(\alpha_0 + m (\delta_i - \delta^*), \tau_c)
\end{align*}
$$

After sampling 12,000 draws, the PPC doesn't look much different from the previous model:

{{< figure src="images/ppc_piecewise.png" caption="PPC for the piecewise linear model." alt="Piecewise linear model PPC" >}}

Let's see the piecewise linear trend:

{{< figure src="images/capability_trend_piecewise.png" caption="Capability trend predicted by the piecewise linear model. Error bars indicate 94\% HDI, and black line is the linear regression determined by the posterior mean of \(\alpha_0, \alpha_1, \alpha_2\)." alt="Capability trend predicted by piecewise linear model" >}}

The model predicts a doubling time of 274 days before the bend, and a doubling time of 100 days after the bend.

|  | mean | sd | hdi_3% | hdi_97% |
|---|---|---|---|---|
| doubling1 | 274 | 5722 | 155 | 507 |
| doubling2 | 100 | 1756 | 62 | 156 |

## Model comparison

To compare the three models, I use PSIS-LOO-CV to assess the tradeoff between increasing the number of parameters and any log-likelihood gains.

The table below shows the ELPD-LOO deviance scores for the two models. Lower ELPD deviance scores are better.

|  | elpd_loo | p_loo | weight | se |
|---|---|---|---|---|
| Per-task vars | 8827 | 599 | 0.12 | 324 |
| Piecewise | 8831 | 603 | 0.81 | 327 |
| Basic | 18007 | 274 | 0.08 | 406 |

Despite the piecewise linear model achieving the best likelihood (given by `weight`), the model with per-task variables has the best ELPD score, suggesting there is not sufficient evidence to justify the additional complexity of the piecewise linear model. Also, adding per-task variance helps a lot compared to the basic model.

## Conclusion

I compared three models: a straightforward Bayesian reformulation of METR's original frequentist approach; the same model but with added per-task noise; and finally, a piecewise linear model that also includes the per-task noise.

I find that the best model (in terms of ELPD score, which penalizes model complexity) is the simple linear model with per-task variables. This model predicts a task doubling time of 190 days, with the 94% HDI between 146 and 234 days.

## Code

 * [Colab notebook](https://colab.research.google.com/github/danielwen/metr-bayesian/blob/main/metr_bayesian.ipynb)
 * [GitHub repo](https://github.com/danielwen/metr-bayesian)

[^1]: Kwa, Thomas, Ben West, Joel Becker, et al. (2025, March). *Measuring AI Ability to Complete Long Tasks*. [METR](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/).
[^2]: Moss, Jonas. (2026, February 13). *METR's data can't distinguish between trajectories*. [LessWrong](https://www.lesswrong.com/posts/sBEzomgnYJmYHki9T/metr-s-data-can-t-distinguish-between-trajectories-and-80).