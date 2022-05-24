import { existsSync, readFileSync, writeFileSync } from 'fs';
import { Logger } from 'winston';
import { ModelCheckpointConfig } from '../api/config';
import { ClassDescriptor } from './class';

/**
 * Class describing the data model contained in the
 * SPARQL endpoint using plain JavaScript classes.
 */
export class DataModel {
    constructor(public descriptors: ClassDescriptor[]) {}

    /**
     * Create a checkpoint from this data model on disk.
     *
     * This checkpoint is a JSON file describing the model,
     * and it can later be loaded with `DataModel.loadCheckpoint()`
     * to restore it. This means you can perform observations just once,
     * save the resulting model, and next time just re-use the
     * finished observations for a nearly instant startup time.
     */
    createCheckpoint(config?: ModelCheckpointConfig, logger?: Logger) {
        if (!config?.saveModelToFile) {
            logger?.debug(
                'Model checkpointing is disabled, not saving model to file.',
            );
            return;
        }
        if (existsSync(config.checkpointFilePath) && !config.overwriteFile) {
            logger?.info(
                'Model checkpoint overwrite is forbidden and a checkpoint file' +
                    ' already exists, not saving model to file.',
            );
            return;
        }
        const stringifiedModel = this.toJSON();
        writeFileSync(config.checkpointFilePath, stringifiedModel);
    }

    /**
     * Load a model checkpoint from disk, returning
     * a new instance of `DataModel` with the checkpoint loaded.
     */
    static loadCheckpoint(
        config?: ModelCheckpointConfig,
        logger?: Logger,
    ): DataModel | undefined {
        if (!config?.loadModelFromCheckpoint) {
            return undefined;
        }

        if (!existsSync(config.checkpointFilePath)) {
            logger?.info('Model checkpoint file does not exist.');
            return undefined;
        }

        const stringifiedModel = readFileSync(
            config.checkpointFilePath,
        ).toString();
        const descriptors = this.fromJSON(stringifiedModel);
        logger?.info('Loaded data model from checkpoint.');
        return new DataModel(descriptors);
    }

    /**
     * Serialize the model's class descriptors to JSON.
     *
     * Since associations may create reference cycles,
     * we have to serialize and deserialize these cyclical
     * references explicitly as IRIs.
     */
    toJSON(): string {
        const serializedModel = JSON.stringify(
            this.descriptors,
            (key, value) => {
                if (key === 'targetClasses') {
                    return (value as ClassDescriptor[]).map((x) => x.iri);
                }

                return value;
            },
        );

        return serializedModel;
    }

    /**
     * Deserialize class descriptors from JSON.
     */
    static fromJSON(json: string): ClassDescriptor[] {
        const descriptors = JSON.parse(json);

        for (const association of descriptors.flatMap(
            (x: ClassDescriptor) => x.associations,
        )) {
            association.targetClasses = association.targetClasses.map(
                (classIRI: string) =>
                    descriptors.find(
                        (x: ClassDescriptor) => x.iri === classIRI,
                    )!,
            );
        }

        return descriptors;
    }
}
