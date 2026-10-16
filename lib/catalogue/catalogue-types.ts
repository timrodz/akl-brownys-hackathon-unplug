import { dataSourceEnum } from "@/lib/db/schema";

export type CatalogueDataSource = (typeof dataSourceEnum.enumValues)[number];
