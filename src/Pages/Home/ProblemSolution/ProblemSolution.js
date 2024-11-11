import React from 'react'
import { useTranslation } from 'react-i18next'
import './ProblemSolution.css'
import ProblemImage from '../../../assets/ProblemSolution/Problem.svg'
import SolutionImage from '../../../assets/ProblemSolution/Solution.svg'
import SmileIcon from '../../../assets/ProblemSolution/smile.png'
import SadIcon from '../../../assets/ProblemSolution/sad.png'

function ProblemSolution() {
	const { t } = useTranslation()

	// Define the points directly to ensure we have arrays
	const problemPoints = [
		{
			text: t('problem_solution.problem.points.0.text'),
			bold: t('problem_solution.problem.points.0.bold'),
			text_after: t('problem_solution.problem.points.0.text_after')
		},
		{
			text: t('problem_solution.problem.points.1.text'),
			bold: t('problem_solution.problem.points.1.bold'),
			text_after: t('problem_solution.problem.points.1.text_after')
		},
		{
			text: t('problem_solution.problem.points.2.text'),
			bold: t('problem_solution.problem.points.2.bold'),
			text_after: t('problem_solution.problem.points.2.text_after')
		}
	]

	const solutionPoints = [
		{
			text: t('problem_solution.solution.points.0.text'),
			bold: t('problem_solution.solution.points.0.bold'),
			text_after: t('problem_solution.solution.points.0.text_after')
		},
		{
			text: t('problem_solution.solution.points.1.text'),
			bold: t('problem_solution.solution.points.1.bold'),
			text_after: t('problem_solution.solution.points.1.text_after')
		},
		{
			text: t('problem_solution.solution.points.2.text'),
			bold: t('problem_solution.solution.points.2.bold'),
			text_after: t('problem_solution.solution.points.2.text_after')
		}
	]

	return (
		<section className="problem-solution__section">
			<div className="headline">
				<h2>
					{t('problem_solution.headline.title')} <br />
					{t('problem_solution.headline.title_break')}
				</h2>
			</div>
			<div className="problem-solution__container">
				<div className="problem-solution">
					<h3 className="problem-solution__title">{t('problem_solution.problem.title')}</h3>
					<p className="problem-solution__description">
						{t('problem_solution.problem.description')}
					</p>
					<img src={ProblemImage} alt="Problem" className="problemsolutionimg" />
					<ul>
						{problemPoints.map((point, index) => (
							<li key={index}>
								<img src={SadIcon} alt="Sad icon" />
								<p>
									{point.text} <b>{point.bold}</b> {point.text_after || ''}
								</p>
							</li>
						))}
					</ul>
				</div>
				<div className="problem-solution">
					<h3 className="problem-solution__title">{t('problem_solution.solution.title')}</h3>
					<p className="problem-solution__description">
						{t('problem_solution.solution.description')}
					</p>
					<img src={SolutionImage} alt="Solution" className="problemsolutionimg" />
					<ul>
						{solutionPoints.map((point, index) => (
							<li key={index}>
								<img src={SmileIcon} alt="Smile icon" />
								<p>
									{point.text} <b>{point.bold}</b> {point.text_after || ''}
								</p>
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	)
}

export default ProblemSolution
