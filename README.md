### PI_Project ID
- database : project.project_id, VARCHAR(32)
- source : 
- remark : 
### Project ID
- database : project.project, VARCHAR(32)
- source : 
- remark : 
### PI
- database : project.pi, VARCHAR(08)
- source : 
- remark : 
### Submission ID
- database : submission.submission_id, VARCHAR(64)
- source : 
- remark : 
### Submission Date
- database : submission.submission_date, DATE
- source : 
- remark : 
### Datatype
- database : submission.datatype, VARCHAR(16)
- source : 
- remark : 
### Requirement
- database : submission.requirement, VARCHAR(32)
- source : 
- remark : 
### Coverage
- database : submission.cov, VARCHAR(16)
- source : 
- remark : 
### Service
- database : submission.srv, VARCHAR(16)
- source : 
- remark : 
### Analysis
- database : submission.anl, VARCHAR(16)
- source : 
- remark : 
### Ref. Genome
- database : submission.rg, VARCHAR(16)
- source : 
- remark : 
### Comment
- database : submission.comment, VARCHAR(100)
- source : 
- remark : 
### Sample Name
- database : sample.sample_name, VARCHAR(64)
- source : 
- remark : 
### Status
- database : sample.status, VARCHAR(16)
- source : 
- remark : 
### Urgent
- database : sample.urgent, VARCHAR(16)
- source : 
- remark : 
### I5 ID
- database : i5.i5_id, VARCHAR(16)
- source : 
- remark : 
### I5 Sequence
- database : i5.i5_sequence, VARCHAR(40)
- source : 
- remark : 
### I7 ID
- database : i7.i7_id, VARCHAR(16)
- source : 
- remark : 
### I7 Sequence
- database : i7.i7_sequence, VARCHAR(40)
- source : 
- remark : 
### Sequencer ID
- database : sequencer.sequencer_id, VARCHAR(16)
- source : 
- remark : 
### Flowcell ID
- database : flowcell.flowcell_id, VARCHAR(16)
- source : 
- remark : 
### Flowcell Type
- database : flowcell.flowcell_type, VARCHAR(16)
- source : 
- remark : 
### Loaded By
- database : flowcell.loaded_by, VARCHAR(16)
- source : 
- remark : 
### Loading Date
- database : flowcell.loading_date, DATE
- source : 
- remark : 
### Completion Date
- database : flowcell.completion_date, DATE
- source : 
- remark : 
### Demultiplex Date
- database : flowcell.demultiplex_date, DATE
- source : 
- remark : 
### Order No
- database : flowcell.order_no, VARCHAR(32)
- source : 
- remark : 
### Position
- database : flowcell.position, VARCHAR(08)
- source : 
- remark : 
### Run ID
- database : flowcell.run_id, VARCHAR(08)
- source : 
- remark : 
### Pool ID
- database : pool.pool_id, VARCHAR(40)
- source : 
- remark : 
### Loading Conc.
- database : pool.loading_conc, NUMERIC(7,2)
- source : 
- remark : 
### Lane 1
- database : pool.lane_1, BOOLEAN
- source : 
- remark : 
### Lane 2
- database : pool.lane_2, BOOLEAN
- source : 
- remark : 
### Lane 3
- database : pool.lane_3, BOOLEAN
- source : 
- remark : 
### Lane 4
- database : pool.lane_4, BOOLEAN
- source : 
- remark : 
### Lane 5
- database : pool.lane_5, BOOLEAN
- source : 
- remark : 
### Lane 6
- database : pool.lane_6, BOOLEAN
- source : 
- remark : 
### Lane 7
- database : pool.lane_7, BOOLEAN
- source : 
- remark : 
### Lane 8
- database : pool.lane_8, BOOLEAN
- source : 
- remark : 
### Lanes
- database : pool.lane, VARCHAR(32)
- source : 
- remark : 
### Sample ID
- database : sample.sample_id, VARCHAR(11)
- source : 
- remark : 
### QPCR
- database : sample.qpcr, NUMERIC(5,2)
- source : 
- remark : 
### Fragment
- database : sample.fragment, NUMERIC(3,0)
- source : 
- remark : 
### Labchip Conc.
- database : sample.labchip_conc, NUMERIC(5,2)
- source : 
- remark : 
### Well
- database : sample.well, VARCHAR(32)
- source : 
- remark : 
### Pre-norm Well
- database : sample.pre_norm_well, VARCHAR(32)
- source : 
- remark : 
### Remark
- database : sample.remark, TEXT
- source : 
- remark : 
### Library Received
- database : sample.lib_received, VARCHAR(17)
- source : 
- remark : 
### Process Date
- database : flowcell.process_date, DATE
- source : 
- remark : 
### MultiQC Ver.
- database : flowcell.multiqc_version, VARCHAR(04)
- source : 
- remark : 
### PF Reads
- database : pool.pf_reads, NUMERIC(7,2)
- source : 
- remark : 
### Q30
- database : pool.q30, NUMERIC(5,2)
- source : 
- remark : 
### Sample QC
- database : sample.sample_qc, VARCHAR(08)
- source : 
- remark : 
### Lib QC
- database : sample.lib_qc, VARCHAR(08)
- source : 
- remark : 
### Stage Date
- database : sample.stage_date, DATE
- source : 
- remark : 
### Staging Error
- database : sample.staging_error, VARCHAR(64)[]
- source : 
- remark : 
### Mean Q Score
- database : sample.mean_qscore, NUMERIC(5,2)
- source : 
- remark : 
### Yeild Q30
- database : sample.yieldq30, NUMERIC(12,0)
- source : 
- remark : 
### Release Date
- database : sample.release_date, DATE
- source : 
- remark : 