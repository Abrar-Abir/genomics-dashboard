# from psycopg2 import extras
# import json
# import csv
# import os
# from datetime import date, datetime
# from log import execution_logger, app_logger
# from library import connect_to_postgres, fetch, get_database_info, enforce_logging, list_nested_paths


# def get_multiqc_data(sample_rows, flowcell_rows):
#     flowcell = flowcell_rows[0]["flowcell_id"]
#     multiqc_json_path = path_join(
#         fcqc_directory, [flowcell, flowcell + '_data', 'multiqc_data.json'], False)
#     with open(multiqc_json_path, "r") as json_file:
#         multiqc_data = json.load(json_file)
#         if "report_saved_raw_data" in multiqc_data:
#             if "multiqc_bcl2fastq_bysample" in multiqc_data["report_saved_raw_data"]:
#                 multiqc = multiqc_data["report_saved_raw_data"]["multiqc_bcl2fastq_bysample"]
#                 tool = 'bcl2fastq'
#             elif "multiqc_bclconvert_bysample" in multiqc_data["report_saved_raw_data"]:
#                 multiqc = multiqc_data["report_saved_raw_data"]["multiqc_bclconvert_bysample"]
#                 tool = 'bclconvert'
#             else:
#                 log_error(False, "multiqc_bysample_not_found_error",
#                           [multiqc_json_path])
#                 return sample_rows, flowcell_rows
#         else:
#             log_error(False, "report_saved_raw_data_not_found_error",
#                       [multiqc_json_path])
#             return sample_rows, flowcell_rows

#     for row_no in range(len(sample_rows)):
#         sample_id = sample_rows[row_no]["sample_id"]
#         if sample_id not in multiqc:
#             app_logger.error(
#                 f"sample_id {sample_id} key was not found in {multiqc_json_path}")
#             sample_rows[row_no]["mean_qscore"] = None
#             sample_rows[row_no]["yieldQ30"] = None
#         else:
#             if tool == 'bclconvert':
#                 sample_rows[row_no]["mean_qscore"] = multiqc[sample_id]["mean_quality"]
#                 sample_rows[row_no]["yieldQ30"] = multiqc[sample_id]["yield"]
#             elif tool == 'bcl2fastq':
#                 sample_rows[row_no]["mean_qscore"] = multiqc[sample_id]["mean_qscore"]
#                 sample_rows[row_no]["yieldQ30"] = multiqc[sample_id]["yieldQ30"]
#             else:
#                 assert False, f"{multiqc_json_path}, {tool}"
#     flowcell_rows[0]['tool'] = tool
#     flowcell_rows[0]['multiqc_version'] = multiqc_data["config_version"]
#     flowcell_rows[0]['demultiplex_date'] = datetime.strptime(
#         multiqc_data['config_creation_date'].split(',')[0], '%Y-%m-%d').date()
#     return sample_rows, flowcell_rows
import os
d = dict()
start = '/gpfs/ngsdata/sap_workplace/www/MultiQC/submission/'
def eda(start):
	with os.scandir(start) as sdrs:
		for sdr in sdrs:
			if os.path.isdir(sdr):
				with os.scandir(sdr) as subs:
					for sub in subs:
						if os.path.isdir(sub):
							f = os.path.join(sub.path, [sub.name + '_data', 'multiqc_data.json'])
							with open(f, "r") as json_file:
								multiqc_data = json.load(json_file)
								if "report_saved_raw_data" in multiqc_data:
									v = multiqc_data["config_version"]
									keys = set(multiqc_data["report_saved_raw_data"].keys())
									d[keys] = d.get(keys, int(v)-1) + 1
								else:
									print('report_saved_raw_data not in ', f)

print(d)

# SDR200082/BL_SDR200082_231109_WGS30N_B1/BL_SDR200082_231109_WGS30N_B1_data

"""('junction_saturation_known', 'junction_saturation_novel', 'multiqc_cutadapt', 'multiqc_dupradar-plot', 'multiqc_fastqc', 'multiqc_fastqc_1', 'multiqc_featurecounts_biotype_plot', 'multiqc_general_stats', 'multiqc_picard_dups', 'multiqc_rsem', 'multiqc_rseqc_bam_stat', 'multiqc_rseqc_infer_experiment', 'multiqc_rseqc_junction_annotation', 'multiqc_rseqc_read_distribution', 'multiqc_samtools_flagstat', 'multiqc_samtools_stats', 'multiqc_star_rsem_deseq2_clustering-plot', 'multiqc_star_rsem_deseq2_pca-plot', 'qualimap_rnaseq_cov_hist', 'qualimap_rnaseq_genome_results', 'rseqc_inner_distance', 'rseqc_junction_saturation_all', 'rseqc_read_dups')
{'NXTRA': 1, 'mRNA-20': 1, 'Lib150': 2, 'mRNA-19': 1}

('junction_saturation_known', 'junction_saturation_novel', 'multiqc_fastqc', 'multiqc_featureCounts', 'multiqc_general_stats', 'multiqc_multiqc-custom-header-plot', 'multiqc_rna_seqc', 'multiqc_rseqc_bam_stat', 'multiqc_rseqc_infer_experiment', 'multiqc_rseqc_junction_annotation', 'multiqc_rseqc_read_distribution', 'multiqc_samtools_stats', 'multiqc_star', 'rseqc_gene_body_cov', 'rseqc_inner_distance', 'rseqc_junction_saturation_all', 'rseqc_read_dups')
{'NXTRA': 1}


('multiqc_fastqc', 'multiqc_general_stats', 'multiqc_picard_AlignmentSummaryMetrics', 'multiqc_picard_HsMetrics', 'multiqc_picard_OxoGMetrics', 'multiqc_picard_insertSize', 'multiqc_picard_wgsmetrics', 'multiqc_samtools_flagstat', 'multiqc_samtools_stats')
{'WGS30N': 219, 'WGS60N': 1, 'CSTM': 1, 'NOVS4': 1, 'Lib150': 1}
# 'multiqc_picard_HsMetrics' missing
('multiqc_fastqc', 'multiqc_general_stats', 'multiqc_picard_AlignmentSummaryMetrics', 'multiqc_picard_OxoGMetrics', 'multiqc_picard_insertSize', 'multiqc_picard_wgsmetrics', 'multiqc_samtools_flagstat', 'multiqc_samtools_stats')
{'WGS30N': 1}
# 'multiqc_picard_insertSize', 'multiqc_picard_wgsmetrics' missing 
('multiqc_fastqc', 'multiqc_general_stats', 'multiqc_picard_AlignmentSummaryMetrics', 'multiqc_picard_HsMetrics', 'multiqc_picard_OxoGMetrics', 'multiqc_samtools_flagstat', 'multiqc_samtools_stats')
{'WES100': 1, 'WES200': 1}
# 'multiqc_picard_dups' extra
('multiqc_fastqc', 'multiqc_general_stats', 'multiqc_picard_AlignmentSummaryMetrics', 'multiqc_picard_HsMetrics', 'multiqc_picard_OxoGMetrics', 'multiqc_picard_dups', 'multiqc_picard_insertSize', 'multiqc_picard_wgsmetrics', 'multiqc_samtools_flagstat', 'multiqc_samtools_stats')
{'WGS30N': 1}
# 'multiqc_picard_dups', 'multiqc_picard_gcbias' extra
('multiqc_fastqc', 'multiqc_general_stats', 'multiqc_picard_AlignmentSummaryMetrics', 'multiqc_picard_HsMetrics', 'multiqc_picard_OxoGMetrics', 'multiqc_picard_dups', 'multiqc_picard_gcbias', 'multiqc_picard_insertSize', 'multiqc_picard_wgsmetrics', 'multiqc_samtools_flagstat', 'multiqc_samtools_stats')
{'Lib150': 2}


('multiqc_fastqc', 'multiqc_featureCounts', 'multiqc_general_stats', 'multiqc_salmon', 'multiqc_samtools_stats', 'multiqc_star')
{'totRNAGlob-50': 9, 'totRNAGlob-40': 1, 'NXTRA': 3, 'mRNA-40': 6, 'totRNA-50': 1, 'mRNA-50': 5, 'Lib150': 2, 'mRNAGlob-50': 2}
# 'multiqc_star' missing
('multiqc_fastqc', 'multiqc_featureCounts', 'multiqc_general_stats', 'multiqc_salmon', 'multiqc_samtools_stats')
{'totRNA-50': 1, 'totRNAGlob-50': 1}
# 'multiqc_salmon' missing
('multiqc_fastqc', 'multiqc_featureCounts', 'multiqc_general_stats', 'multiqc_samtools_stats', 'multiqc_star')
{'NXTRA': 1}
# 'multiqc_salmon', 'multiqc_samtools_stats' missing
('multiqc_fastqc', 'multiqc_featureCounts', 'multiqc_general_stats', 'multiqc_star')
{'mRNA-40': 2}


('multiqc_fastqc', 'multiqc_general_stats')
{'WGS30N': 27, 'totRNAGlob-50': 4, 'Lib150': 6, 'WES200': 3, 'WGS90N': 3, '10XscRNA': 9, 'totRNA-50': 6, 'FFPE-RNA': 1, 'totRNAGlob-40': 1, '50': 1, 'CSTM': 5, '16srRNA': 1, 'mRNA-40': 2}





('multiqc_fastqc', 'multiqc_general_stats', 'multiqc_htseq', 'multiqc_rseqc_read_distribution', 'multiqc_star')
{'LEX8': 35}
# 'multiqc_rseqc_read_distribution_1' & 'multiqc_star_1' extra 
('multiqc_fastqc', 'multiqc_general_stats', 'multiqc_htseq', 'multiqc_rseqc_read_distribution', 'multiqc_rseqc_read_distribution_1', 'multiqc_star', 'multiqc_star_1')
{'LEX8': 2}





('multiqc_bowtie1', 'multiqc_fastqc', 'multiqc_general_stats', 'multiqc_mirtrace_complexity', 'multiqc_mirtrace_contamination', 'multiqc_mirtrace_length', 'multiqc_mirtrace_summary')
{'sRNA8M': 1}




('dragen_frag_len', 'dragen_gvcf_metrics', 'dragen_map_metrics', 'dragen_overall_mean_cov_data', 'dragen_ploidy', 'dragen_qc_region_1_coverage_metrics', 'dragen_qc_region_2_coverage_metrics', 'dragen_qc_region_3_coverage_metrics', 'dragen_time_metrics', 'dragen_trimmer_metrics', 'dragen_vc_metrics', 'dragen_wgs_cov_metrics', 'multiqc_general_stats', 'multiqc_qcflags', 'multiqc_qcflags_1', 'multiqc_qcflags_2', 'multiqc_qcflags_3')
{'Lib150': 29}

('dragen_cov_metrics', 'dragen_frag_len', 'dragen_map_metrics', 'dragen_ploidy', 'dragen_time_metrics', 'dragen_trimmer_metrics', 'dragen_vc_metrics', 'multiqc_general_stats')
{'Lib150': 2, 'NOVS4': 1}





NXTRA
['SD_SDR400053_240408_NXTRA_B1', 'AG_SDR100021_220310_NXTRA_B1', 'AD_OPS-20220803_221108_NXTRA_B1', 'NvP_SDR400093_230720_NXTRA_B1', 'CC_SDR100040_230523_NXTRA_B1', 'AD_OPS-20230411_230413_NXTRA_B1']


mRNA-20
['SD_SDR400053_230924_mRNA-20_B1']


WGS30N
['KH_SDR400106_230207_WGS30N_B1', 'IJ_SDR100037_221222_WGS30N_B1', 'IJ_SDR100037_221222_WGS30N_B4', 'IJ_SDR100037_221222_WGS30N_B2', 'IJ_SDR100037_230124_WGS30N_B1', 'IJ_SDR100037_220523_WGS30N_B1', 'IJ_SDR100037_221222_WGS30N_B5', 'IJ_SDR100037_221222_WGS30N_B3', 'AG_SDR100021_220310_WGS30N_B1', 'YM_SDR100031_221004_WGS30N_B1', 'YM_SDR100031_240229_WGS30N_B1', 'YM_SDR100031_230321_WGS30N_B1', 'YM_SDR100031_220929_WGS30N_B1', 'YM_SDR100031_230726_WGS30N_B1', 'YM_SDR100031_221107_WGS30N_B1', 'YM_SDR100031_240215_WGS30N_B1', 'CC_SDR400111_220920_WGS30N_B1', 'Q_IGS_22_03_002_220515_WGS30N_B1', 'JR_IGS2403HMC_240325_WGS30N_B1', 'KF_SDR100034_230626_WGS30N_B1', 'KF_SDR100034_230123_WGS30N_B1', 'KF_SDR100034_240226_WGS30N_B1', 'KF_SDR100034_230613_WGS30N_B1', 'KF_SDR100034_230416_WGS30N_B1', 'KF_SDR100034_230911_WGS30N_B1', 'KF_SDR100034_230302_WGS30N_B1', 'KF_SDR100034_220815_WGS30N_B1', 'KF_SDR100034_220725_WGS30N_B1', 'KF_SDR100034_220807_WGS30N_B1', 'KF_SDR100034_221018_WGS30N_B1', 'KF_SDR100034_230117_WGS30N_B1', 'KF_SDR100034_221221_WGS30N_B1', 'KF_SDR100034_230313_WGS30N_B1', 'KF_SDR100034_220929_WGS30N_B1', 'KF_SDR100034_230614_WGS30N_B1', 'KF_SDR100034_231211_WGS30N_B1', 'KF_SDR100034_220706_WGS30N_B1', 'KF_SDR100034_240103_WGS30N_B1', 'AAK_SDR400186_240327_WGS30N_B1', 'OS_SDR400194_240114_WGS30N_B1', 'MH_SDR100061_220217_WGS30N_B1', 'MK_SDR100061_221114_WGS30N_B1', 'MK_SDR100061_230417_WGS30N_B1', 'MK_SDR100061_240422_WGS30N_B1', 'MK_SDR100061_231024_WGS30N_B1', 'MK_SDR100061_230503_WGS30N_B1', 'MK_SDR100061_230613_WGS30N_B1', 'MK_SDR100061_230830_WGS30N_B1', 'MK_SDR100061_230405_WGS30N_B1', 'WH_SDR200074_230925_WGS30N_B1', 'WH_SDR200074_240117_WGS30N_B1', 'WH_SDR200074_240324_WGS30N_B1', 'WH_SDR200074_220929_WGS30N_B1', 'WH_SDR200074_220905_WGS30N_B1', 'WH_SDR200074_230705_WGS30N_B1', 'WH_SDR200074_240221_WGS30N_B1', 'WH_SDR200074_230405_WGS30N_B1', 'WH_SDR200074_230712_WGS30N_B1', 'WH_SDR200074_230824_WGS30N_B1', 'WH_SDR200074_220908_WGS30N_B1', 'KF_SDR400034_220804_WGS30N_B1', 'KF_SDR400034_230117_WGS30N_B1', 'KF_SDR400034_230611_WGS30N_B1', 'KF_SDR400034_230125_WGS30N_B1', 'KF_SDR400034_230724_WGS30N_B1', 'KF_SDR400034_240229_WGS30N_B1', 'KF_SDR400034_240328_WGS30N_B1', 'KF_SDR400034_230605_WGS30N_B1', 'KF_SDR400034_240111_WGS30N_B1', 'KF_SDR400034_240421_WGS30N_B1', 'KF_SDR400034_231109_WGS30N_B1', 'KF_SDR400034_230503_WGS30N_B1', 'KF_SDR400034_240318_WGS30N_B1', 'KF_SDR400034_240418_WGS30N_B1', 'KF_SDR400034_230410_WGS30N_B1', 'KF_SDR400034_240314_WGS30N_B1', 'KF_SDR400034_221227_WGS30N_B2', 'KF_SDR400034_230921_WGS30N_B1', 'KF_SDR400034_230626_WGS30N_B1', 'KF_SDR400034_230731_WGS30N_B1', 'KF_SDR400034_231101_WGS30N_B1', 'KF_SDR400034_230830_WGS30N_B1', 'KF_SDR400034_240429_WGS30N_B1', 'KF_SDR400034_2230917_WGS30N_B1', 'KF_SDR400034_221113_WGS30N_B1', 'KF_SDR400034_221030_WGS30N_B1', 'KF_SDR400034_231010_WGS30N_B1', 'KF_SDR400034_240206_WGS30N_B1', 'KF_SDR400034_230321_WGS30N_B2', 'KF_SDR400034_231127_WGS30N_B1', 'KF_SDR400034_230208_WGS30N_B1', 'KF_SDR400034_230811_WGS30N_B1', 'KF_SDR400034_221227_WGS30N_B1', 'KF_SDR400034_230216_WGS30N_B1', 'KF_SDR400034_220724_WGS30N_B1', 'KF_SDR400034_221020_WGS30N_B1', 'KF_SDR400034_220606_WGS30N_B1', 'KF_SDR400034_240301_WGS30N_B1', 'KF_SDR400034_240221_WGS30N_B1', 'KF_SDR400034_230911_WGS30N_B1', 'KF_SDR400034_220428_WGS30N_B1', 'KF_SDR400034_220929_WGS30N_B1', 'KF_SDR400034_230608_WGS30N_B1', 'KF_SDR400034_230904_WGS30N_B1', 'KF_SDR400034_221016_WGS30N_B1', 'KF_SDR400034_240123_WGS30N_B1', 'KF_SDR400034_231119_WGS30N_B1', 'KF_SDR400034_230321_WGS30N_B1', 'KF_SDR400034_230730_WGS30N_B1', 'KF_SDR400034_221227_WGS30N_B3', 'KF_SDR400034_240311_WGS30N_B1', 'KF_SDR400034_240324_WGS30N_B1', 'KF_SDR400034_220818_WGS30N_B1', 'KF_SDR400034_231204_WGS30N_B1', 'KF_SDR400034_240317_WGS30N_B1', 'KF_SDR400034_220601_WGS30N_B1', 'KF_SDR400034_220417_WGS30N_B1', 'KF_SDR400034_220929_WGS30N_B2', 'KF_SDR400034_230515_WGS30N_B1', 'KF_SDR400034_230912_WGS30N_B1', 'KF_SDR400034_240202_WGS30N_B1', 'KF_SDR400034_230809_WGS30N_B1', 'KF_SDR400034_220804_WGS30N_B2', 'AGS_IGS-23_04_006_230416_WGS30N_B1', 'AGS_IGS-23_02_005_230219_WGS30N_B1', 'KF_SDR400152_220928_WGS30N_B1', 'BL_SDR200082_231211_WGS30N_B1', 'BL_SDR200082_231109_WGS30N_B1', 'AAK_SDR100043_231003_WGS30N_B1', 'AAK_SDR100043_231003_WGS30N_B2', 'KH_SDR100013_220324_WGS30N_B1', 'KF_SDR200080_230208_WGS30N_B1', 'KF_SDR200080_230216_WGS30N_B1', 'KF_SDR200080_221208_WGS30N_B1', 'KF_SDR200080_240602_WGS30N_B1', 'KF_SDR200080_221221_WGS30N_B1', 'BL_SDR400013_211207_WGS30N_B1', 'BL_SDR400013_221127_WGS30N_B1', 'BL_SDR400013_220718_WGS30N_B1', 'BL_SDR200070_211207_WGS30N_B1', 'BL_SDR400013_220511_WGS30N_B1', 'BL_SDR400013_220904_WGS30N_B1', 'BL_SDR400013_220810_WGS30N_B1', 'BL_SDR400013_220616_WGS30N_B1', 'BL_SDR400013_221107_WGS30N_B1', 'BL_SDR400013_220615_WGS30N_B1', 'BL_SDR400013_230115_WGS30N_B1', 'BL_SDR400013_230412_WGS30N_B1', 'BL_SDR400013_220920_WGS30N_B1', 'BL_SDR400013_221013_WGS30N_B1', 'BL_SDR400013_221206_WGS30N_B1', 'BL_SDR400013_221113_WGS30N_B1', 'CC_SDR100053_220316_WGS30N_B1', 'CC_SDR100053_211118_WGS30N_B1', 'CC_SDR100053_230417_WGS30N_B1', 'CC_SDR100053_231211_WGS30N_B1', 'CC_SDR100053_220823_WGS30N_B1', 'KF_SDR400034_240317_WGS30N_B1', 'LS_SDR200039_230514_WGS30N_B1', 'YM_SDR400076_231211_WGS30N_B1', 'YM_SDR400076_221128_WGS30N_B1', 'CC_SDR200057_220804_WGS30N_B1', 'CC_SDR200057_220921_WGS30N_B1', 'CC_SDR200057_220213_WGS30N_B1', 'CC_SDR200057_221205_WGS30N_B1', 'CC_SDR200057_221103_WGS30N_B2', 'CC_SDR200057_221103_WGS30N_B1', 'CC_SDR200057_220215_WGS30N_B1', 'TA_SDR600146_231231_WGS30N_B1', 'BL_SDR200070_230726_WGS30N_B1', 'BL_SDR200070_230522_WGS30N_B1', 'BL_SDR200070_240226_WGS30N_B1', 'SDR200070_211207_WGS30N_B1', 'BL_SDR200070_240108_WGS30N_B1', 'BL_SDR200070_230611_WGS30N_B1', 'BL_SDR200070_230227_WGS30N_B1', 'BL_SDR200070_240111_WGS30N_B1', 'BL_SDR200070_230830_WGS30N_B1', 'BL_SDR200070_230622_WGS30N_B1', 'BL_SDR200070_231221_WGS30N_B1', 'BL_SDR200070_231004_WGS30N_B1', 'JR_IGS2402HMC_240602_WGS30N_B1', 'JR_IGS2402HMC_240204_WGS30N_B1', 'QGP_QGP-LTR_230603_WGS30N_B1', 'KF_SDR100012_220217_WGS30N_B1', 'KF_SDR100012_220628_WGS30N_B1', 'KF_SDR100012_230522_WGS30N_B1', 'KF_SDR100012_230811_WGS30N_B1', 'KF_SDR100012_220220_WGS30N_B1', 'KF_SDR100012_230321_WGS30N_B1', 'KF_SDR100012_220323_WGS30N_B1', 'KF_SDR100012_231216_WGS30N_B1', 'KF_SDR100012_220606_WGS30N_B1', 'KF_SDR100012_230104_WGS30N_B1', 'KF_SDR100012_220810_WGS30N_B1', 'KF_SDR100012_221026_WGS30N_B1', 'KF_SDR100012_220523_WGS30N_B1', 'KF_SDR100012_220623_WGS30N_B1', 'KF_SDR100012_240520_WGS30N_B1', 'KF_SDR100012_230830_WGS30N_B1', 'KF_SDR100012_240214_WGS30N_B1', 'KF_SDR100012_230730_WGS30N_B1', 'BL_SDR200079_240409_WGS30N_B1', 'BL_SDR200079_240221_WGS30N_B1', 'BL_SDR200079_240408_WGS30N_B1', 'BL_SDR200079_240519_WGS30N_B1', 'BL_SDR200079_240520_WGS30N_B1', 'KH_SDR100052_230302_WGS30N_B1', 'KH_SDR100052_230205_WGS30N_B1', 'KH_SDR100052_230511_WGS30N_B1', 'KH_SDR100052_230620_WGS30N_B1', 'KH_SDR100052_230201_WGS30N_B1', 'KH_SDR100052_230417_WGS30N_B1', 'KH_SDR100052_220823_WGS30N_B1', 'KH_SDR100052_230103_WGS30N_B1', 'KH_SDR100052_240117_WGS30N_B1', 'KH_SDR100052_221002_WGS30N_B1', 'KF_SDR100039_230720_WGS30N_B1', 'KF_SDR100039_221016_WGS30N_B1', 'KF_SDR100039_220629_WGS30N_B1', 'KF_SDR100039_230501_WGS30N_B1', 'KF_SDR100039_220427_WGS30N_B1', 'KF_SDR100039_220330_WGS30N_B1', 'PAT_PGNS4_230417_WGS30N_B1', 'AAK_SDR400149_230227_WGS30N_B1', 'AAK_SDR400149_220427_WGS30N_B1', 'KAS_SDR200038_230803_WGS30N_B1', 'KAS_SDR200038_220912_WGS30N_B2', 'KAS_SDR200038_220912_WGS30N_B1', 'KAS_SDR200038_231204_WGS30N_B1', 'JD_IGS-22_03_002_231204_WGS30N_B1', 'AGS_IGS-22_09_003_221127_WGS30N_B1', 'DB_SDR600049_220728_WGS30N_B1', 'MA_SDR400185_240505_WGS30N_B1', 'MA_SDR400185_230104_WGS30N_B1', 'MA_SDR400185_230504_WGS30N_B1', 'MA_SDR400185_230321_WGS30N_B1', 'MA_SDR400185_230227_WGS30N_B1', 'MA_SDR400185_231010_WGS30N_B1', 'MA_SDR400185_231003_WGS30N_B1', 'MA_SDR400185_230724_WGS30N_B1', 'MA_SDR400185_231220_WGS30N_B1', 'MA_SDR400185_240523_WGS30N_B1', 'MA_SDR400185_230206_WGS30N_B1', 'MA_SDR400185_240326_WGS30N_B1', 'YM_SDR200049_231211_WGS30N_B1', 'YM_SDR200049_240512_WGS30N_B1', 'YM_SDR200049_230522_WGS30N_B1']


totRNAGlob-50
['IJ_SDR100037_230410_totRNAGlob-50_B1', 'IJ_SDR100037_230410_totRNAGlob-50_B2', 'IJ_SDR100037_230410_totRNAGlob-50_B3', 'IJ_SDR100037_230410_totRNAGlob-50_B4', 'AG_SDR100021_220921_totRNAGlob-50_B1', 'YM_SDR100031_231220_totRNAGlob-50_B1', 'YM_SDR100031_220929_totRNAGlob-50_B1', 'KF_SDR400034_201027_totRNAGlob-50_B1', 'KF_SDR400034_230611_totRNAGlob-50_B1', 'AG_NPRP10-SDR100021_220616_totRNAGlob-50_B1', 'GP_SDR200060_221005_totRNAGlob-50_B1', 'GP_SDR200077_231113_totRNAGlob-50_B1', 'GP_SDR400131_231113_totRNAGlob-50_B1', 'YM_SDR200049_231220_totRNAGlob-50_B1']


totRNAGlob-40
['IJ_SDR100037_220523_totRNAGlob-40_B1', 'YM_SDR100032_201109_totRNAGlob-40_B1']


mRNA-40
['CC_SDR400111_220920_mRNA-40_B1', 'CC_SDR100040_230727_mRNA-40_B1', 'CC_SDR100040_220920_mRNA-40_B2', 'CC_SDR100040_220920_mRNA-40_B1', 'BL_SDR400013_220511_mRNA-40_B1', 'LS_SDR400164_221030_mRNA-40_B1', 'LS_SDR400164_221016_mRNA-40_B1', 'BL_SDR200079_240214_mRNA-40_B1', 'DB_SDR400183_221206_mRNA-40_B1', 'WH_SDR400183_230405_mRNA-40_B1']


WGS60N
['CC_SDR400111_220920_WGS60N_B1']


Lib150
['MEG_SDR200073_220904_Lib150_B1', 'LS_SDR400081_230724_Lib150_B2', 'LS_SDR400081_230724_Lib150_B1', 'BL_SDR400013_230205_Lib150_B1', 'AG_NPRP10-SDR100021_220929_Lib150_B1', 'PAT_PGNS4_240606_Lib150_B1', 'PAT_PGNS4_240711_Lib150_B1', 'PAT_PGNS4_240418_Lib150_B2', 'PAT_PGNS4_231015_Lib150_B1', 'PAT_PGNS4_240502_Lib150_B1', 'PAT_PGNS4_240917_Lib150_B1', 'PAT_PGNS4_241003_Lib150_B1', 'PAT_PGNS4_241015_Lib150_B1', 'PAT_PGNS4_240613_Lib150_B1', 'PAT_PGNS4_240423_Lib150_B1', 'PAT_PGNS4_240418_Lib150_B1', 'PAT_PGNS4_240806_Lib150_B1', 'PAT_PGNS4_231019_Lib150_B1', 'PAT_PGNS4_230806_Lib150_B1', 'PAT_PGNS4_230920_Lib150_B1', 'PAT_PGNS4_240208_Lib150_B1', 'PAT_PGNS4_240725_Lib150_B1', 'PAT_PGNS4_240718_Lib150_B1', 'PAT_PGNS4_241029_Lib150_B1', 'PAT_PGNS4_240828_Lib150_B1', 'PAT_PGNS4_240808_Lib150_B1', 'PAT_PGNS4_241008_Lib150_B1', 'PAT_PGNS4_240820_Lib150_B1', 'PAT_PGNS4_240314_Lib150_B1', 'PAT_PGNS4_240125_Lib150_B1', 'PAT_PGNS4_230813_Lib150_B1', 'PAT_PGNS4_240701_Lib150_B1', 'PAT_PGNS4_230815_Lib150_B1', 'PAT_PGNS4_240903_Lib150_B1', 'PAT_PGNS4_230928_Lib150_B1', 'PAT_PGNS4_240910_Lib150_B1', 'PAT_PGNS4_240925_Lib150_B1', 'PAT_PGNS4_230727_Lib150_B2', 'PAT_PGNS4_241020_Lib150_B1', 'PAT_PGNS4_240528_Lib150_B1', 'PAT_PGNS4_240509_Lib150_B1', 'PAT_PGNS4_240814_Lib150_B1', 'PAT_PGNS4_240520_Lib150_B1', 'PAT_PGNS4_240514_Lib150_B1']


CSTM
['OS_SDR400194_230712_CSTM_B1', 'WH_SDR400184_240609_CSTM_B1', 'PT_PGNS6_221201_CSTM_B1', 'TAM_SDR200083A_230522_CSTM_B1', 'NvP_SDR400129_221106_CSTM_B1', 'AGS_IGS-22_09_003_220911_CSTM_B1']


WES100
['MK_SDR100061_220623_WES100_B1']


WES200
['WH_SDR200074_240324_WES200_B1', 'TAM_SDR4000029_231129_WES200_B1', 'AAK_SDR100043_231129_WES200_B1', 'WH_SDR400156_230528_WES200_B1']


WGS90N
['WH_SDR200074_230824_WGS90N_B1', 'WH_SDR200074_220929_WGS90N_B1', 'WH_SDR200074_231120_WGS90N_B1']


10XscRNA
['WH_SDR200074_230912_10XscRNA_B1', 'NvP_SDR100038_230618_10XscRNA_B1', 'NvP_SDR100038_240514_10XscRNA_B1', 'CM_SDR400018_231017_10XscRNA_B1', 'CM_SDR400018_230618_10XscRNA_B1', 'DB_SDR100035_221006_10XscRNA_B1', 'WH_SDR600163_240520_10XscRNA_B1', 'NvP_SDR400137_220623_10XscRNA_B1', 'SD_SDR200019_230305_10XscRNA_B1']


totRNA-50
['WH_SDR200074_230925_totRNA-50_B1', 'WH_SDR200074_230712_totRNA-50_B1', 'WH_SDR200074_230824_totRNA-50_B1', 'WH_SDR200074_220929_totRNA-50_B1', 'WH_SDR200074_231120_totRNA-50_B1', 'CM_SDR4C100003_220606_totRNA-50_B1', 'WH_SDR400156_230528_totRNA-50_B1', 'CM_SDR400018_240506_totRNA-50_B1']


FFPE-RNA
['WH_SDR200074_240226_FFPE-RNA_B1']


50
['YM_SDR100032_211215_totRNAGlob_50_B1']


NOVS4
['SL_SDR400097_220330_NOVS4_B1', 'PAT_PGNS4_231226_NOVS4_B1']


LEX8
['NvP_SDR400093_221016_LEX8_B1', 'NvP_SDR100038_221207_LEX8_B1', 'WH_SDR400184_230830_LEX8_B1', 'CC_SDR100040_240314_LEX8_B1', 'JG_SDR400167_220818_LEX8_B2', 'JG_SDR400167_220920_LEX8_B1', 'JG_SDR400167_220818_LEX8_B1', 'CM_SDR100003_240326_LEX8_B1', 'CM_SDR100003_240311_LEX8_B1', 'SAK_SDR100028_220202_LEX8_B1', 'SAK_SDR400153_231109_LEX8_B1', 'SAK_SDR400153_231109_LEX8_B2', 'WH_SDR600163_231216_LEX8_B1', 'WH_SDR600163_230925_LEX8_B1', 'WH_SDR600163_240404_LEX8_B1', 'SAK_SDR400161_231119_LEX8_B1', 'SAK_SDR400089_220802_LEX8_B1', 'SAK_SDR400089_230516_LEX8_B5', 'SAK_SDR400089_230516_LEX8_B9', 'SAK_SDR400089_221002_LEX8_B5', 'SAK_SDR400089_220802_LEX8_B3', 'SAK_SDR400089_230516_LEX8_B2', 'SAK_SDR400089_230516_LEX8_B8', 'SAK_SDR400089_221002_LEX8_B4', 'SAK_SDR400089_230516_LEX8_B3', 'SAK_SDR400089_221219_LEX8_B1', 'SAK_SDR400089_221002_LEX8_B3', 'SAK_SDR400089_230516_LEX8_B1', 'SAK_SDR400089_221002_LEX8_B1', 'SAK_SDR400089_220802_LEX8_B5', 'SAK_SDR400089_230516_LEX8_B4', 'SAK_SDR400089_221002_LEX8_B2', 'SAK_SDR400089_220802_LEX8_B4', 'SAK_SDR400089_230516_LEX8_B10', 'SAK_SDR400089_230516_LEX8_B6', 'SAK_SDR400089_230516_LEX8_B7', 'SAK_SDR400089_220802_LEX8_B2']


mRNA-50
['BL_SDR400013_230216_mRNA-50_B1', 'BL_SDR400013_230406_mRNA-50_B1', 'BL_SDR400013_221103_mRNA-50_B1', 'BL_SDR400013_230730_mRNA-50_B1', 'BL_SDR400013_220704_mRNA-50_B1']


mRNAGlob-50
['AAK_SDR100002_211212_mRNAGlob-50_B2', 'AAK_SDR100002_211212_mRNAGlob-50_B1']


sRNA8M
['AAK_SDR100002_211115_sRNA8M_B1']


mRNA-19
['LS_SDR400078_210718_mRNA-19_B1']


16srRNA
['DC_SDR200065_211201_16srRNA_B1']


"""
"""
			general
				stats
			fastqc
				stats
tool->		picard
metric ->		AlignmentSummaryMetrics
				OxoGMetrics
				multiqc_picard_wgsmetrics
				...
			samtools
				flagstat
				stat
				...

"""