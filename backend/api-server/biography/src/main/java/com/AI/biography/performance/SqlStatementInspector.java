package com.AI.biography.performance;

import org.hibernate.resource.jdbc.spi.StatementInspector;

public class SqlStatementInspector implements StatementInspector {
    @Override
    public String inspect(String sql) {
        SqlDiagnostics.inspect(sql);
        return sql;
    }
}
